use axum::{extract::State, Json};
use serde::Deserialize;
use serde_json::json;
use xiandong_tennis_core::scorer;

use crate::error::AppError;
use crate::state::AppState;

/// Request body for creating a new quiz result record.
#[derive(Deserialize)]
pub struct CreateResultRequest {
    answers: Vec<Option<char>>,
    result_type: String,
}

/// Persist a completed quiz result to the database.
pub async fn create_result(
    State(state): State<AppState>,
    Json(payload): Json<CreateResultRequest>,
) -> Result<Json<serde_json::Value>, AppError> {
    valid_answers_for_payload(&payload)?;

    let answers_json = serde_json::to_string(&payload.answers)
        .expect("serializing answer slots to JSON is infallible");

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

fn valid_answers_for_payload(payload: &CreateResultRequest) -> Result<Vec<char>, AppError> {
    if payload.answers.len() != 16 {
        return Err(AppError::BadRequest(
            "answers must contain exactly 16 items".to_string(),
        ));
    }

    let mut valid_answers = Vec::with_capacity(payload.answers.len());
    for answer in &payload.answers {
        match answer {
            Some(c @ ('A' | 'B' | 'C' | 'D')) => valid_answers.push(*c),
            Some(c) => {
                return Err(AppError::BadRequest(format!("invalid answer value: {}", c)));
            }
            None => {}
        }
    }

    let expected_result_type = scorer::calculate_result(&valid_answers).as_str();
    if payload.result_type != expected_result_type {
        return Err(AppError::BadRequest(format!(
            "result_type must match calculated result: {}",
            expected_result_type
        )));
    }

    Ok(valid_answers)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn accepts_sixteen_answer_slots_with_skips() {
        let mut answers = vec![Some('A'); 16];
        answers[2] = None;
        let payload = CreateResultRequest {
            answers,
            result_type: "SHIELD".to_string(),
        };

        let valid_answers = valid_answers_for_payload(&payload).expect("payload should be valid");

        assert_eq!(valid_answers.len(), 15);
    }

    #[test]
    fn rejects_missing_answer_slots() {
        let payload = CreateResultRequest {
            answers: vec![Some('A'); 15],
            result_type: "SHIELD".to_string(),
        };

        let err = valid_answers_for_payload(&payload).expect_err("payload should be rejected");

        assert!(matches!(err, AppError::BadRequest(message) if message.contains("exactly 16")));
    }

    #[test]
    fn rejects_result_type_that_does_not_match_answers() {
        let payload = CreateResultRequest {
            answers: vec![Some('A'); 16],
            result_type: "HAMMER".to_string(),
        };

        let err = valid_answers_for_payload(&payload).expect_err("payload should be rejected");

        assert!(matches!(err, AppError::BadRequest(message) if message.contains("result_type")));
    }
}
