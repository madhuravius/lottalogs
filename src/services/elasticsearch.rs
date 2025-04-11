use async_trait::async_trait;
use elasticsearch::{http::transport::Transport, Elasticsearch, Error};
use serde::{Deserialize, Serialize};
use serde_json::json;
use tracing::info;

use crate::views::logs::{LogResponse, LogsQueryParameters, Message};

#[async_trait]
pub trait ElasticsearchServiceTrait: Send + Sync {
    async fn health_check(&self) -> Result<(), Error>;
    async fn search(&self, params: LogsQueryParameters) -> Result<LogResponse, Error>;
}

pub struct ElasticsearchService {
    client: Elasticsearch,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct EsSource {
    message: String,
    host: String,
    timestamp: String,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct EsHit {
    #[serde(rename = "_id")]
    id: String,
    #[serde(rename = "_index")]
    index: String,
    #[serde(rename = "_source")]
    source: EsSource,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct EsHitsTotal {
    value: u64,
    relation: String,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct EsHits {
    hits: Vec<EsHit>,
    total: EsHitsTotal,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct EsResponse {
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
}

#[async_trait]
impl ElasticsearchServiceTrait for ElasticsearchService {
    /// Checks the health of the Elasticsearch cluster.
    ///
    /// # Errors
    ///
    /// Returns an error if the health check fails.
    async fn health_check(&self) -> Result<(), Error> {
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
    async fn search(&self, params: LogsQueryParameters) -> Result<LogResponse, Error> {
        let search_text = params.search_text.unwrap_or_default();
        let min_timestamp = params.min_timestamp.as_deref();
        let max_timestamp = params.max_timestamp.as_deref();
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
                    "gt": min_timestamp,
                    "lt": max_timestamp,
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
            let log_responses: Vec<Message> = es_response
                .hits
                .hits
                .into_iter()
                .map(|hit| Message {
                    message: hit.source.message,
                    host: hit.source.host,
                    index: hit.index,
                    timestamp: hit.source.timestamp,
                    id: hit.id,
                })
                .collect();

            Ok(LogResponse {
                messages: log_responses,
                total: es_response.hits.total.value,
            })
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

#[cfg(test)]
pub mod tests {
    use httptest::ServerBuilder;
    use httptest::{matchers::*, responders::*, Expectation, Server};
    use serde_json::json;

    use super::{EsHit, EsHits, EsHitsTotal, EsResponse, EsSource};

    pub fn mock_es_search_success(uri: String) -> Server {
        let server = ServerBuilder::new()
            .bind_addr(([127, 0, 0, 1], 9201).into())
            .run()
            .unwrap();
        server.expect(
            Expectation::matching(request::method_path("POST", uri)).respond_with(json_encoded(
                json!(EsResponse {
                    hits: EsHits {
                        hits: vec![EsHit {
                            id: "1".to_string(),
                            index: "logs".to_string(),
                            source: EsSource {
                                message: "Test log message".to_string(),
                                host: "localhost".to_string(),
                                timestamp: "2023-10-01T00:00:00Z".to_string(),
                            },
                        }],
                        total: EsHitsTotal {
                            value: 1,
                            relation: "eq".to_string(),
                        },
                    },
                }),
            )),
        );
        server
    }

    pub fn mock_es_search_failure() -> Server {
        let server = ServerBuilder::new()
            .bind_addr(([127, 0, 0, 1], 9201).into())
            .run()
            .unwrap();
        server.expect(
            Expectation::matching(request::method_path("POST", "/_search"))
                .respond_with(status_code(500)),
        );
        server
    }
}
