use super::helpers::test_solution;
use super::types::{ExecuteRequestBody, ExecutionResultPayload, SubmissionResult};

use axum::{http::StatusCode, Json};
use log::info;
use reqwest::header::CONTENT_TYPE;

pub async fn execute_handler(
    Json(payload): Json<ExecuteRequestBody>,
) -> Result<Json<SubmissionResult>, StatusCode> {
    info!("Got code execution request");
    let output = match test_solution(payload.language, payload.solution, payload.tests).await {
        Err(_) => return Err(StatusCode::INTERNAL_SERVER_ERROR),
        Ok(result) => result,
    };

    let client = reqwest::Client::new();
    let res: Result<reqwest::Response, reqwest::Error> = client
        .post(format!(
            "http://localhost:8082/submissions/{}",
            payload.submission_id
        ))
        .header(CONTENT_TYPE, "application/json")
        .json(&ExecutionResultPayload {
            results: output.clone(),
        })
        .send()
        .await;

    info!("Sent execution results to the main api");
    match res {
        Err(_) => Err(StatusCode::INTERNAL_SERVER_ERROR),
        Ok(_) => Ok(Json(output)),
    }
}
