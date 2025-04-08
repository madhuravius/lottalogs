use async_trait::async_trait;
use axum::Extension;
use loco_rs::{
    app::{AppContext, Hooks, Initializer},
    bgworker::Queue,
    boot::{create_app, BootResult, StartMode},
    config::Config,
    controller::AppRoutes,
    environment::Environment,
    task::Tasks,
    Result,
};
use migration::Migrator;
use std::{path::Path, sync::Arc};
use tracing::info;

use crate::{common::settings::Settings, services::elasticsearch::ElasticsearchServiceTrait};
#[allow(unused_imports)]
use crate::{controllers, tasks};

pub struct App;
#[async_trait]
impl Hooks for App {
    fn app_name() -> &'static str {
        env!("CARGO_CRATE_NAME")
    }

    fn app_version() -> String {
        format!(
            "{} ({})",
            env!("CARGO_PKG_VERSION"),
            option_env!("BUILD_SHA")
                .or(option_env!("GITHUB_SHA"))
                .unwrap_or("dev")
        )
    }

    async fn boot(
        mode: StartMode,
        environment: &Environment,
        config: Config,
    ) -> Result<BootResult> {
        create_app::<Self, Migrator>(mode, environment, config).await
    }

    async fn initializers(_ctx: &AppContext) -> Result<Vec<Box<dyn Initializer>>> {
        Ok(vec![])
    }

    fn routes(_ctx: &AppContext) -> AppRoutes {
        AppRoutes::with_default_routes() // controller routes below
            .add_route(controllers::logs::routes())
    }

    async fn after_routes(router: axum::Router, ctx: &AppContext) -> Result<axum::Router> {
        let settings_json = ctx
            .config
            .settings
            .as_ref()
            .expect("Settings must be present in context");
        let settings = Settings::from_json(settings_json)?;
        info!(
            "Registering with elasticsearch url: {:?}",
            settings.elasticsearch_url
        );
        let elasticsearch_url = settings
            .elasticsearch_url
            .as_deref()
            .expect("Elasticsearch URL must be set");
        let elasticsearch_service =
            crate::services::elasticsearch::ElasticsearchService::new(elasticsearch_url);
        let elasticsearch_extension: Arc<dyn ElasticsearchServiceTrait> =
            Arc::new(elasticsearch_service.unwrap());
        info!("Elasticsearch service registered");

        Ok(router.layer(Extension(elasticsearch_extension)))
    }

    async fn connect_workers(_ctx: &AppContext, _queue: &Queue) -> Result<()> {
        Ok(())
    }

    #[allow(unused_variables)]
    fn register_tasks(tasks: &mut Tasks) {
        // tasks-inject (do not remove)
    }
    async fn truncate(_ctx: &AppContext) -> Result<()> {
        Ok(())
    }
    async fn seed(_ctx: &AppContext, _base: &Path) -> Result<()> {
        Ok(())
    }
}
