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
        .add("/status/", get(status))
        .add("/", get(index))
}

#[cfg(test)]
mod tests {
    use axum::http::StatusCode;
    use loco_rs::{prelude::request, testing};
    use serial_test::serial;

    use crate::{
        app::App,
        services::elasticsearch::tests::{
            mock_es_search_failure,
            mock_es_search_success, // mock_es_search_failure, mock_es_search_success,
        },
    };

    #[tokio::test]
    #[serial]
    async fn get_logs_status() {
        request::<App, _, _>(|request, ctx| async move {
            testing::db::seed::<App>(&ctx).await.unwrap();
            let res = request.get("/api/logs/status").await;
            assert_eq!(res.status_code(), StatusCode::OK);
        })
        .await;
    }

    #[tokio::test]
    #[serial]
    async fn get_logs_search_success_index() {
        request::<App, _, _>(|request, ctx| async move {
            testing::db::seed::<App>(&ctx).await.unwrap();
            let _server = mock_es_search_success("/_search".to_string());
            let res = request.get("/api/logs").await;
            assert_eq!(res.status_code(), 200);
        })
        .await;
    }

    #[tokio::test]
    #[serial]
    async fn get_logs_search_success_with_filters() {
        request::<App, _, _>(|request, ctx| async move {
            testing::db::seed::<App>(&ctx).await.unwrap();
            let _server = mock_es_search_success("/**/_search".to_string());
            let res = request
                .get("/api/logs?search_text=test&min_timestamp=2023-10-01T00:00:00Z")
                .await;
            assert_eq!(res.status_code(), 200);
        })
        .await;
    }

    #[tokio::test]
    #[serial]
    async fn get_logs_search_failure() {
        request::<App, _, _>(|request, ctx| async move {
            testing::db::seed::<App>(&ctx).await.unwrap();
            let _server = mock_es_search_failure();
            let res = request.get("/api/logs").await;
            assert_eq!(res.status_code(), 500);
        })
        .await;
    }
}
