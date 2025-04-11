use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct LogResponse {
    pub messages: Vec<Message>,
    pub total: u64,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct Message {
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
    pub min_timestamp: Option<String>,
    pub max_timestamp: Option<String>,
}

/// Returns `Self` with default values applied to fields that are `None`.
///
/// # Returns
///
/// A new instance with default values applied.
impl LogsQueryParameters {
    #[must_use]
    pub fn with_defaults(mut self) -> Self {
        if self.search_text.is_none() {
            self.index = Some(String::new());
        }
        if self.index.is_none() {
            self.index = Some("**".to_string());
        }
        if self.size.is_none() {
            self.size = Some(100);
        }
        if self.min_timestamp.is_none() {
            self.min_timestamp = Some("1970-01-01T00:00:00Z".to_string());
        }
        if self.max_timestamp.is_none() {
            self.max_timestamp = Some("2040-01-01T00:00:00Z".to_string());
        }
        self
    }
}
