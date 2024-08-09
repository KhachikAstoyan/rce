use std::collections::HashMap;

use serde::{Deserialize, Serialize};

use crate::language::Language;

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct SubmissionResult {
    pub success: bool,
    pub passed: u32,
    pub failed: u32,
    pub test_results: Vec<TestResult>,
}

impl SubmissionResult {
    pub fn error_json() -> String {
        r#"{
            "success": false,
            "passed": 0,
            "failed": 0,
            "testResults": []
        }"#
        .to_string()
    }
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ExecuteRequestPayload {
    pub submission_id: String,
    pub language: Language,
    pub solution: String,
    pub tests: TestSuite,
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct TestSuite {
    pub problem_id: String,
    pub tests: Vec<Test>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Test {
    pub inputs: HashMap<String, ValueType>,
    pub expected: ValueType,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ValueType {
    #[serde(rename = "type")]
    pub value_type: String,
    pub value: String,
}

#[derive(Serialize)]
pub struct ExecutionResultPayload {
    pub results: SubmissionResult,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct TestResult {
    pub success: bool,
    pub assertion_results: Vec<AssertionResult>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct AssertionResult {
    pub expected: String,
    pub received: String,
}
