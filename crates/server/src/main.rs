use axum::{routing::post, Router};
use std::net::SocketAddr;
use tower_http::cors::CorsLayer;
use tracing::info;
use xiandong_server::{config::Config, routes, state::AppState};

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt::init();

    let config = Config::from_env();
    let state = AppState::new(&config.database_url)
        .await
        .expect("failed to connect to database");

    // Run embedded migrations so the schema is up to date on startup.
    sqlx::migrate!("./migrations")
        .run(&state.db)
        .await
        .expect("failed to run migrations");

    let app = Router::new()
        .route("/api/results", post(routes::results::create_result))
        .layer(CorsLayer::permissive())
        .with_state(state);

    let addr = SocketAddr::from(([127, 0, 0, 1], config.port));
    info!("server listening on {}", addr);

    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
