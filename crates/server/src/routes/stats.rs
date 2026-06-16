use axum::{extract::State, Json};
use serde::Serialize;
use serde_json::json;

use crate::error::AppError;
use crate::state::AppState;

#[derive(sqlx::FromRow, Serialize)]
struct PersonalityCount {
    result_type: String,
    count: i64,
}

/// GET /api/results/stats
///
/// Returns aggregate counts per personality type and total submissions.
pub async fn get_stats(State(state): State<AppState>) -> Result<Json<serde_json::Value>, AppError> {
    let rows: Vec<PersonalityCount> = sqlx::query_as(
        "SELECT result_type, COUNT(*) as count FROM results GROUP BY result_type ORDER BY count DESC",
    )
    .fetch_all(&state.db)
    .await
    .map_err(AppError::Internal)?;

    let distribution: serde_json::Map<String, serde_json::Value> = rows
        .iter()
        .map(|r| (r.result_type.clone(), json!({ "count": r.count })))
        .collect();

    let total: i64 = rows.iter().map(|r| r.count).sum();

    Ok(Json(json!({
        "total": total,
        "distribution": distribution,
    })))
}

/// GET /api/results/latest (last 10)
pub async fn get_latest(
    State(state): State<AppState>,
) -> Result<Json<serde_json::Value>, AppError> {
    #[derive(sqlx::FromRow)]
    struct Row {
        id: i32,
        result_type: String,
        created_at: chrono::DateTime<chrono::Utc>,
    }

    let rows: Vec<Row> = sqlx::query_as(
        "SELECT id, result_type, created_at FROM results ORDER BY created_at DESC LIMIT 10",
    )
    .fetch_all(&state.db)
    .await
    .map_err(AppError::Internal)?;

    let items: Vec<serde_json::Value> = rows
        .iter()
        .map(|r| {
            json!({
                "id": r.id,
                "resultType": r.result_type,
                "createdAt": r.created_at.to_rfc3339(),
            })
        })
        .collect();

    Ok(Json(json!({ "items": items })))
}
