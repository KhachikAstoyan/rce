use super::helpers::test_solution;
use super::types::{ExecuteRequestPayload, SubmissionResult};

use log::info;

pub async fn execute_handler(
    payload: ExecuteRequestPayload,
) -> Result<SubmissionResult, Box<dyn std::error::Error>> {
    info!("Got code execution request");
    let output: crate::executor::types::SubmissionResult = test_solution(
        payload.language,
        payload.solution,
        payload.skeleton,
        payload.tests,
    )
    .await?;

    info!("Sent execution results to the main api");
    return Ok(output);
}
