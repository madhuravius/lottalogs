use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct LogResponse {
    pub message: String,
    pub host: String,
    pub index: String,
    pub timestamp: String,
    pub id: String,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct LogsQueryParameters {
    pub search_text: Option<String>,
    pub index: Option<String>,
    pub size: Option<u64>,
}

impl LogsQueryParameters {
    pub fn with_defaults(mut self) -> Self {
        if self.search_text.is_none() {
            self.index = Some("".to_string());
        }
        if self.index.is_none() {
            self.index = Some("**".to_string());
        }
        if self.size.is_none() {
            self.size = Some(100);
        }
        self
    }
}
