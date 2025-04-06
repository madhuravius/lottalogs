use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Default, Debug)]
pub struct Settings {
    pub elasticsearch_url: Option<String>,
}

impl Settings {
    /// Deserialize settings from a JSON value.
    ///
    /// # Errors
    ///
    /// Returns an error if deserialization fails.
    pub fn from_json(value: &serde_json::Value) -> Result<Self, serde_json::Error> {
        serde_json::from_value(value.clone())
    }
}
