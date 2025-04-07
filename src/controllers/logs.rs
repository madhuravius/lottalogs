#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use std::{collections::HashMap, sync::Arc};
use tracing::error;

use axum::{debug_handler, extract::Query, Extension};
use loco_rs::prelude::*;

use crate::{services::elasticsearch::ElasticsearchServiceTrait, views::logs::LogsQueryParameters};

#[debug_handler]
pub async fn index(
    State(_ctx): State<AppContext>,
    Extension(e): Extension<Arc<dyn ElasticsearchServiceTrait>>,
    Query(params): Query<LogsQueryParameters>,
) -> Result<Response> {
    let params = params.with_defaults();
    let search_response = match e.search(params).await {
        Ok(response) => response,
        Err(err) => {
            error!("Failed to query Elasticsearch: {:?}", err);
            return Err(Error::InternalServerError);
        }
    };

    format::render().json(search_response)
}

#[debug_handler]
pub async fn status(
    State(_ctx): State<AppContext>,
    Extension(e): Extension<Arc<dyn ElasticsearchServiceTrait>>,
) -> Result<Response> {
    let _ = e.health_check().await;
    format::render().json(HashMap::from([("status", "healthy")]))
}

pub fn routes() -> Routes {
    Routes::new()
        .prefix("api/logs/")
        .add("/status", get(status))
        .add("/", get(index))
}

#[cfg(test)]
mod tests {
    use loco_rs::prelude::request;

    use crate::{app::App, services::elasticsearch::tests::mock_es_health_check};

    #[tokio::test]
    async fn can_get_logs_status() {
        mock_es_health_check();
        request::<App, _, _>(|request, _ctx| async move {
            let res = request.get("/api/logs/status").await;
            assert_eq!(res.status_code(), 200);
        })
        .await;
    }
}
