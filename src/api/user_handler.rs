use axum::{
    extract::{Path, State},
    http::HeaderMap,
    Json, Router,
};
use crate::config::AppConfig;
use crate::db::DbPool;
use crate::error::{AppError, Result};
use crate::models::user::{LoginRequest, User, UserUpdate};
use crate::models::ApiResponse;
use crate::repo::user_repo;
use crate::service::auth_service;
use std::sync::Arc;

pub fn router(pool: DbPool, config: Arc<AppConfig>) -> Router {
    Router::new()
        .route("/api/users/register", axum::routing::post(register))
        .route("/api/users/login", axum::routing::post(login))
        .route("/api/users/me", axum::routing::get(me))
        .route("/api/users/logout", axum::routing::post(logout))
        .route("/api/users", axum::routing::get(list_users))
        .route(
            "/api/users/:id",
            axum::routing::put(update_user).delete(delete_user),
        )
        .with_state((pool, config))
}

/// 从 HeaderMap 中提取 JWT claims
fn extract_claims_from_headers(headers: &HeaderMap) -> Result<auth_service::Claims> {
    let token = headers
        .get("authorization")
        .and_then(|v| v.to_str().ok())
        .and_then(|v| v.strip_prefix("Bearer "))
        .ok_or_else(|| AppError::Validation("未提供登录凭证".into()))?;
    auth_service::verify_token(token)
}

/// POST /api/users/register — 注册用户
async fn register(
    State((pool, _config)): State<(DbPool, Arc<AppConfig>)>,
    Json(body): Json<serde_json::Value>,
) -> Result<Json<ApiResponse<User>>> {
    let username = body
        .get("username")
        .and_then(|v| v.as_str())
        .ok_or_else(|| AppError::Validation("用户名不能为空".into()))?
        .trim()
        .to_string();
    let password = body
        .get("password")
        .and_then(|v| v.as_str())
        .ok_or_else(|| AppError::Validation("密码不能为空".into()))?
        .to_string();
    let division_id = body.get("division_id").and_then(|v| v.as_i64());
    let group_id = body.get("group_id").and_then(|v| v.as_i64());

    if username.is_empty() || password.is_empty() {
        return Err(AppError::Validation("用户名和密码不能为空".into()));
    }

    let user = auth_service::register(&pool, &username, &password, division_id, group_id)?;
    Ok(Json(ApiResponse::ok(user)))
}

/// POST /api/users/login — 登录
async fn login(
    State((pool, _config)): State<(DbPool, Arc<AppConfig>)>,
    Json(body): Json<LoginRequest>,
) -> Result<Json<ApiResponse<crate::models::user::LoginResponse>>> {
    let resp = auth_service::login(&pool, &body)?;
    Ok(Json(ApiResponse::ok(resp)))
}

/// GET /api/users/me — 获取当前用户信息
async fn me(
    State((pool, _config)): State<(DbPool, Arc<AppConfig>)>,
    headers: HeaderMap,
) -> Result<Json<ApiResponse<User>>> {
    let claims = extract_claims_from_headers(&headers)?;
    let user = user_repo::find_by_id(&pool, claims.sub)?
        .ok_or_else(|| AppError::NotFound("用户不存在".into()))?;

    if !user.is_active {
        return Err(AppError::Validation("该账号已被停用".into()));
    }

    Ok(Json(ApiResponse::ok(user)))
}

/// GET /api/users — 用户列表（管理员）
async fn list_users(
    State((pool, _config)): State<(DbPool, Arc<AppConfig>)>,
    headers: HeaderMap,
) -> Result<Json<ApiResponse<Vec<User>>>> {
    let _claims = extract_claims_from_headers(&headers)?;
    let users = user_repo::list_all(&pool)?;
    Ok(Json(ApiResponse::ok(users)))
}

/// PUT /api/users/:id — 更新用户
async fn update_user(
    State((pool, _config)): State<(DbPool, Arc<AppConfig>)>,
    Path(id): Path<i64>,
    headers: HeaderMap,
    Json(body): Json<UserUpdate>,
) -> Result<Json<ApiResponse<User>>> {
    let claims = extract_claims_from_headers(&headers)?;
    let user = user_repo::update(&pool, id, &body, &claims.username)?;
    Ok(Json(ApiResponse::ok(user)))
}

/// DELETE /api/users/:id — 删除用户（软删除）
async fn delete_user(
    State((pool, _config)): State<(DbPool, Arc<AppConfig>)>,
    Path(id): Path<i64>,
    headers: HeaderMap,
) -> Result<Json<ApiResponse<()>>> {
    let claims = extract_claims_from_headers(&headers)?;
    user_repo::soft_delete(&pool, id, &claims.username)?;
    Ok(Json(ApiResponse::ok_msg("删除成功")))
}

/// POST /api/users/logout — 登出
async fn logout(
    State((pool, _config)): State<(DbPool, Arc<AppConfig>)>,
    headers: HeaderMap,
) -> Result<Json<ApiResponse<()>>> {
    let token = headers
        .get("authorization")
        .and_then(|v| v.to_str().ok())
        .and_then(|v| v.strip_prefix("Bearer "))
        .unwrap_or("");

    if !token.is_empty() {
        auth_service::logout(&pool, token)?;
    }
    Ok(Json(ApiResponse::ok_msg("已登出")))
}
