use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize)]
pub struct LogResponse {
    pub message: String,
    pub host: String,
    pub index: String,
    pub timestamp: bool,
    pub id: String,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct LogsQueryParameters {
    pub index: Option<String>,
}

impl LogsQueryParameters {
    pub fn with_defaults(mut self) -> Self {
        if self.index.is_none() {
            self.index = Some("**".to_string());
        }
        self
    }
}
