use sqlx::PgPool;

/// Shared application state passed to Axum handlers.
#[derive(Clone)]
pub struct AppState {
    pub db: PgPool,
}

impl AppState {
    /// Create state by connecting to the given database URL.
    pub async fn new(database_url: &str) -> Result<Self, sqlx::Error> {
        let db = PgPool::connect(database_url).await?;
        Ok(Self { db })
    }
}
