use super::helpers::test_solution;
use super::types::{ExecuteRequestPayload, SubmissionResult};

use log::info;

pub async fn execute_handler(
    payload: ExecuteRequestPayload,
) -> Result<SubmissionResult, Box<dyn std::error::Error>> {
    info!("Got code execution request");
    let output: crate::executor::types::SubmissionResult =
        test_solution(payload.language, payload.solution, payload.tests).await?;

    println!("{:?}", output);
    println!("test results {:?}", output.test_results);

    // let client = reqwest::Client::new();
    // let res = client
    //     .post(format!(
    //         "http://localhost:8082/submissions/{}",
    //         payload.submission_id
    //     ))
    //     .header(CONTENT_TYPE, "application/json")
    //     .json(&ExecutionResultPayload {
    //         results: output.clone(),
    //     })
    //     .send()
    //     .await?;

    info!("Sent execution results to the main api");
    return Ok(output);
}
