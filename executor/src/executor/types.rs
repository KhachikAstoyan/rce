use std::collections::HashMap;

use serde::{Deserialize, Serialize};

use crate::language::Language;

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ExecuteRequestBody {
    pub submission_id: String,
    pub language: Language,
    pub solution: String,
    pub tests: Tests,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Tests {
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

#[derive(Serialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct SubmissionResult {
    pub success: bool,
    pub passed: u32,
    pub failed: u32,
    pub test_results: Vec<TestResult>,
}

#[derive(Serialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct TestResult {
    pub success: bool,
    pub assertion_results: Vec<AssertionResult>,
}

#[derive(Serialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct AssertionResult {
    pub expected: String,
    pub received: String,
}
