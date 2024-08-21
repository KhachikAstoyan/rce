use super::helpers::test_solution;
use super::types::{ExecuteRequestPayload, SubmissionResult};

use log::info;

pub async fn execute_handler(payload: ExecuteRequestPayload) -> SubmissionResult {
    info!("Got code execution request");
    let output = test_solution(
        payload.language,
        payload.solution,
        payload.skeleton,
        payload.tests,
    )
    .await;

    info!("Sent execution results to the main api");
    return match output {
        Ok(v) => v,
        Err(_) => SubmissionResult {
            failed: 0,
            message: "couldn't execute your code, please try again later".into(),
            passed: 0,
            submission_id: Some(payload.submission_id),
            success: false,
            test_results: vec![],
        },
    };
}
