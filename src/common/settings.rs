use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Default, Debug)]
pub struct Settings {
    pub elasticsearch_url: Option<String>,
}

impl Settings {
    pub fn from_json(value: &serde_json::Value) -> Result<Self, serde_json::Error> {
        Ok(serde_json::from_value(value.clone())?)
    }
}
