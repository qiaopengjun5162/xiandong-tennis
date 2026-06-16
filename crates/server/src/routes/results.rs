use axum::{extract::State, Json};
use serde::Deserialize;
use serde_json::json;

use crate::error::AppError;
use crate::state::AppState;

/// Request body for creating a new quiz result record.
#[derive(Deserialize)]
pub struct CreateResultRequest {
    answers: Vec<char>,
    result_type: String,
}

/// Persist a completed quiz result to the database.
pub async fn create_result(
    State(state): State<AppState>,
    Json(payload): Json<CreateResultRequest>,
) -> Result<Json<serde_json::Value>, AppError> {
    // Enforce the fixed 16-question quiz length.
    if payload.answers.len() != 16 {
        return Err(AppError::BadRequest(
            "answers must contain exactly 16 items".to_string(),
        ));
    }

    // Validate that every answer is one of the allowed options.
    for c in &payload.answers {
        if !matches!(c, 'A' | 'B' | 'C' | 'D') {
            return Err(AppError::BadRequest(format!("invalid answer value: {}", c)));
        }
    }

    let answers_json = serde_json::to_string(&payload.answers)
        .expect("serializing a char vec to JSON is infallible");

    let record: ResultRecord = sqlx::query_as(
        "INSERT INTO results (answers, result_type) VALUES ($1, $2) RETURNING id, result_type, created_at",
    )
    .bind(&answers_json)
    .bind(&payload.result_type)
    .fetch_one(&state.db)
    .await
    .map_err(AppError::Internal)?;

    Ok(Json(json!({
        "id": record.id,
        "resultType": record.result_type,
        "createdAt": record.created_at,
    })))
}

#[derive(sqlx::FromRow)]
struct ResultRecord {
    id: i32,
    result_type: String,
    created_at: chrono::DateTime<chrono::Utc>,
}
