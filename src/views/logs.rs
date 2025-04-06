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
    pub start_timestamp: Option<String>,
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
        if self.start_timestamp.is_none() {
            self.start_timestamp = Some("1970-01-01T00:00:00Z".to_string());
        }
        self
    }
}
