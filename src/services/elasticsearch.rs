use elasticsearch::{http::transport::Transport, Elasticsearch, Error};
use tracing::info;

use crate::views::logs::LogsQueryParameters;

pub struct ElasticsearchService {
    client: Elasticsearch,
}

impl ElasticsearchService {
    pub fn new(elasticsearch_url: &str) -> Result<Self, Error> {
        let transport = Transport::single_node(elasticsearch_url)?;
        let client = Elasticsearch::new(transport);
        info!(
            "Elasticsearch client created with URL: {}",
            elasticsearch_url
        );
        Ok(Self { client })
    }

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

    pub async fn search(&self, params: LogsQueryParameters) -> Result<serde_json::Value, Error> {
        let query = serde_json::json!({
            "query": {
                "match": {
                    "message": {
                        "query": format!("{}{}{}", "*", params.search_text.unwrap_or_default(), "*")
                    }
                }
            },
            "size": params.size,
        });

        let response = self
            .client
            .search(elasticsearch::SearchParts::Index(&[params.index.unwrap().as_str()]))
            .body(query)
            .send()
            .await?;

        if response.status_code().is_success() {
            let body = response.json::<serde_json::Value>().await?;
            Ok(body)
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
