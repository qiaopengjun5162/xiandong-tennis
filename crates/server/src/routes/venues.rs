use axum::{extract::Query, extract::State, Json};
use serde::{Deserialize, Serialize};
use serde_json::json;

use crate::error::AppError;
use crate::state::AppState;

const DEFAULT_LIMIT: i64 = 50;
const MAX_LIMIT: i64 = 100;

#[derive(Deserialize)]
pub struct VenueListQuery {
    area: Option<String>,
    q: Option<String>,
    limit: Option<i64>,
}

struct VenueListParams {
    area: Option<String>,
    search: Option<String>,
    limit: i64,
}

impl From<VenueListQuery> for VenueListParams {
    fn from(query: VenueListQuery) -> Self {
        let limit = query.limit.unwrap_or(DEFAULT_LIMIT).clamp(1, MAX_LIMIT);

        Self {
            area: non_empty_filter(query.area),
            search: non_empty_filter(query.q),
            limit,
        }
    }
}

#[derive(sqlx::FromRow)]
struct VenueRow {
    id: i32,
    name: String,
    area: String,
    address: String,
    outdoor_courts: i32,
    indoor_courts: i32,
    covered_courts: i32,
    total_courts: i32,
    booking_note: Option<String>,
    source_label: String,
    source_updated_on: Option<chrono::NaiveDate>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct VenueResponse {
    id: i32,
    name: String,
    area: String,
    address: String,
    courts: CourtCounts,
    booking_note: Option<String>,
    source: VenueSource,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct CourtCounts {
    outdoor: i32,
    indoor: i32,
    covered: i32,
    total: i32,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct VenueSource {
    label: String,
    updated_on: Option<String>,
}

impl From<VenueRow> for VenueResponse {
    fn from(row: VenueRow) -> Self {
        Self {
            id: row.id,
            name: row.name,
            area: row.area,
            address: row.address,
            courts: CourtCounts {
                outdoor: row.outdoor_courts,
                indoor: row.indoor_courts,
                covered: row.covered_courts,
                total: row.total_courts,
            },
            booking_note: row.booking_note,
            source: VenueSource {
                label: row.source_label,
                updated_on: row.source_updated_on.map(|date| date.to_string()),
            },
        }
    }
}

pub async fn list_venues(
    State(state): State<AppState>,
    Query(query): Query<VenueListQuery>,
) -> Result<Json<serde_json::Value>, AppError> {
    let params = VenueListParams::from(query);

    let rows: Vec<VenueRow> = sqlx::query_as(
        r#"
        SELECT
          id,
          name,
          area,
          address,
          outdoor_courts,
          indoor_courts,
          covered_courts,
          total_courts,
          booking_note,
          source_label,
          source_updated_on
        FROM venues
        WHERE ($1::TEXT IS NULL OR area = $1)
          AND (
            $2::TEXT IS NULL
            OR name ILIKE '%' || $2 || '%'
            OR address ILIKE '%' || $2 || '%'
          )
        ORDER BY area ASC, name ASC
        LIMIT $3
        "#,
    )
    .bind(&params.area)
    .bind(&params.search)
    .bind(params.limit)
    .fetch_all(&state.db)
    .await
    .map_err(AppError::Internal)?;

    let items: Vec<VenueResponse> = rows.into_iter().map(VenueResponse::from).collect();

    Ok(Json(json!({
        "items": items,
        "limit": params.limit,
    })))
}

pub async fn list_venue_areas(
    State(state): State<AppState>,
) -> Result<Json<serde_json::Value>, AppError> {
    #[derive(sqlx::FromRow, Serialize)]
    #[serde(rename_all = "camelCase")]
    struct AreaRow {
        area: String,
        venue_count: i64,
    }

    let rows: Vec<AreaRow> = sqlx::query_as(
        r#"
        SELECT area, COUNT(*) AS venue_count
        FROM venues
        GROUP BY area
        ORDER BY area ASC
        "#,
    )
    .fetch_all(&state.db)
    .await
    .map_err(AppError::Internal)?;

    Ok(Json(json!({ "items": rows })))
}

fn non_empty_filter(value: Option<String>) -> Option<String> {
    value.and_then(|value| {
        let trimmed = value.trim();
        if trimmed.is_empty() {
            None
        } else {
            Some(trimmed.to_string())
        }
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn trims_blank_filters() {
        let params = VenueListParams::from(VenueListQuery {
            area: Some("  高新区  ".to_string()),
            q: Some("   ".to_string()),
            limit: None,
        });

        assert_eq!(params.area.as_deref(), Some("高新区"));
        assert_eq!(params.search, None);
        assert_eq!(params.limit, DEFAULT_LIMIT);
    }

    #[test]
    fn clamps_limit_to_safe_range() {
        let high = VenueListParams::from(VenueListQuery {
            area: None,
            q: None,
            limit: Some(500),
        });
        let low = VenueListParams::from(VenueListQuery {
            area: None,
            q: None,
            limit: Some(0),
        });

        assert_eq!(high.limit, MAX_LIMIT);
        assert_eq!(low.limit, 1);
    }
}
