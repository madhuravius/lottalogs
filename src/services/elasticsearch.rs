use elasticsearch::{http::transport::Transport, Elasticsearch, Error};
use serde::Deserialize;
use serde_json::json;
use tracing::info;

use crate::views::logs::{LogResponse, LogsQueryParameters};

pub struct ElasticsearchService {
    client: Elasticsearch,
}

#[derive(Debug, Deserialize)]
struct EsSource {
    message: String,
    host: String,
    timestamp: String,
}

#[derive(Debug, Deserialize)]
struct EsHit {
    #[serde(rename = "_id")]
    id: String,
    #[serde(rename = "_index")]
    index: String,
    #[serde(rename = "_source")]
    source: EsSource,
}

#[derive(Debug, Deserialize)]
struct EsHits {
    hits: Vec<EsHit>,
}

#[derive(Debug, Deserialize)]
struct EsResponse {
    hits: EsHits,
}

impl ElasticsearchService {
    /// Create a new Elasticsearch client with the given URL.
    ///
    /// # Errors
    ///
    /// Returns an error if the client could not be created.
    pub fn new(elasticsearch_url: &str) -> Result<Self, Error> {
        let transport = Transport::single_node(elasticsearch_url)?;
        let client = Elasticsearch::new(transport);
        info!(
            "Elasticsearch client created with URL: {}",
            elasticsearch_url
        );
        Ok(Self { client })
    }

    /// Checks the health of the Elasticsearch cluster.
    ///
    /// # Errors
    ///
    /// Returns an error if the health check fails.
    pub async fn health_check(&self) -> Result<(), Error> {
        let response = self.client.ping().send().await?;
        if response.status_code().is_success() {
            info!("Elasticsearch is healthy!");
            Ok(())
        } else {
            Err(elasticsearch::Error::from(std::io::Error::new(
                std::io::ErrorKind::Other,
                format!(
                    "Elasticsearch health check failed with status: {}",
                    response.status_code()
                ),
            )))
        }
    }

    /// Searches for logs matching the given parameters.
    ///
    /// # Errors
    ///
    /// Returns an error if the search request fails.
    ///
    /// # Panics
    ///
    /// This function will panic if the index parameter is `None`.
    pub async fn search(&self, params: LogsQueryParameters) -> Result<Vec<LogResponse>, Error> {
        let search_text = params.search_text.unwrap_or_default();
        let start_timestamp = params.start_timestamp.as_deref();
        let match_block = if search_text.is_empty() {
            json!({ "match_all": {} })
        } else {
            json!({
                "match": {
                    "message": {
                        "query": format!("{}{}{}", "*", search_text, "*")
                    }
                },
            })
        };
        let mut filter_clauses = Vec::new();
        filter_clauses.push(json!({
            "range": {
                "timestamp": {
                    "gt": start_timestamp
                }
            }
        }));
        let query = serde_json::json!({
            "query": {
                "bool": {
                    "must": match_block,
                    "filter": filter_clauses
                }
            },
            "size": params.size,
            "sort": [
            {
                "timestamp": {
                    "order": "desc"
                }
            }
            ]
        });

        let response = self
            .client
            .search(elasticsearch::SearchParts::Index(&[params
                .index
                .unwrap()
                .as_str()]))
            .body(query)
            .send()
            .await?;

        if response.status_code().is_success() {
            let es_response = response.json::<EsResponse>().await?;
            let log_responses: Vec<LogResponse> = es_response
                .hits
                .hits
                .into_iter()
                .map(|hit| LogResponse {
                    message: hit.source.message,
                    host: hit.source.host,
                    index: hit.index,
                    timestamp: hit.source.timestamp,
                    id: hit.id,
                })
                .collect();

            Ok(log_responses)
        } else {
            Err(elasticsearch::Error::from(std::io::Error::new(
                std::io::ErrorKind::Other,
                format!(
                    "Search query failed with status: {}",
                    response.status_code()
                ),
            )))
        }
    }
}
