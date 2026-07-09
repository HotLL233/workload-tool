use axum::{
    extract::{Path, Query, State},
    Json, Router,
};
use crate::db::DbPool;
use crate::error::Result;
use crate::models::sample_info::{
    SampleInfoCreate, SampleInfoQuery, SampleInfoStatusUpdate, SampleInfoResponse,
    SampleInfoUpdate,
};
use crate::models::{ApiResponse, PaginatedResponse};
use crate::repo::sample_info_repo;

pub fn router(pool: DbPool) -> Router {
    Router::new()
        .route("/api/sample-info", axum::routing::get(list).post(create))
        .route(
            "/api/sample-info/:id",
            axum::routing::put(update).delete(soft_delete),
        )
        .route(
            "/api/sample-info/:id/status",
            axum::routing::put(update_status),
        )
        .with_state(pool)
}

async fn list(
    State(pool): State<DbPool>,
    Query(q): Query<SampleInfoQuery>,
) -> Result<Json<ApiResponse<PaginatedResponse<SampleInfoResponse>>>> {
    let page = q.page.unwrap_or(1);
    let page_size = q.page_size.unwrap_or(20).min(500);
    let (items, total) = sample_info_repo::list(
        &pool,
        q.detection_type.as_deref(),
        q.status.as_deref(),
        page,
        page_size,
    )?;
    Ok(Json(ApiResponse::ok(PaginatedResponse {
        items,
        total,
        page,
        page_size,
    })))
}

async fn create(
    State(pool): State<DbPool>,
    Json(body): Json<SampleInfoCreate>,
) -> Result<Json<ApiResponse<SampleInfoResponse>>> {
    let record = sample_info_repo::create(&pool, &body)?;
    Ok(Json(ApiResponse::ok(record)))
}

async fn update(
    State(pool): State<DbPool>,
    Path(id): Path<i64>,
    Json(body): Json<SampleInfoUpdate>,
) -> Result<Json<ApiResponse<SampleInfoResponse>>> {
    let record = sample_info_repo::update(&pool, id, &body, "system")?;
    Ok(Json(ApiResponse::ok(record)))
}

async fn soft_delete(
    State(pool): State<DbPool>,
    Path(id): Path<i64>,
) -> Result<Json<ApiResponse<()>>> {
    sample_info_repo::soft_delete(&pool, id, "system")?;
    Ok(Json(ApiResponse::ok_msg("删除成功")))
}

async fn update_status(
    State(pool): State<DbPool>,
    Path(id): Path<i64>,
    Json(body): Json<SampleInfoStatusUpdate>,
) -> Result<Json<ApiResponse<SampleInfoResponse>>> {
    let record = sample_info_repo::update_status(&pool, id, &body.status, "system")?;
    Ok(Json(ApiResponse::ok(record)))
}
