use crate::executor::types::SubmissionResult;
use crate::language::Language;
use log::info;
use std::str;
use std::sync::Arc;
use std::{io, path::PathBuf, process::Output, time::Duration};
use tokio::time::timeout;
use tokio::{fs, process::Command};

use super::types::Tests;

const INPUTS_DIR: &str = "/app/inputs";
const SUBMISSIONS_DIR: &str = "/app/submissions";

pub async fn test_solution(
    lang: Language,
    code: String,
    tests: Tests,
) -> Result<SubmissionResult, io::Error> {
    info!("Testing solution {:?}", tests.problem_id);

    let json = serde_json::to_string(&tests)?;
    let paths = Arc::new(get_file_paths(&tests.problem_id, &lang, json, &code).await?);

    info!("Formed paths for host and container");

    let container_output = run_docker_container(Arc::clone(&paths), &lang).await?;

    info!("Finished running docker container");
    info!(
        target: "docker:stdout",
        "{:?}",
        str::from_utf8(&container_output.stdout).unwrap_or_default()
    );
    info!(
        target: "docker:stderr",
        "{:?}",
        str::from_utf8(&container_output.stderr).unwrap_or_default()
    );

    return Ok(SubmissionResult {
        failed: 3,
        passed: 0,
        success: false,
        test_results: vec![],
    });
}

async fn run_docker_container(paths: Arc<FilePaths>, lang: &Language) -> Result<Output, io::Error> {
    info!("Running docker container");
    let cmd = Command::new("docker")
        .arg("run")
        // .arg("--rm")
        .arg("--network")
        .arg("none")
        .arg("-v")
        .arg(format!(
            "{}:/{}:ro",
            paths.input_host_path.to_str().unwrap(),
            paths.input_container_path.to_str().unwrap()
        ))
        .arg("-v")
        .arg(format!(
            "{}:/{}:ro",
            paths.submission_host_path.to_str().unwrap(),
            paths.submission_container_path.to_str().unwrap()
        ))
        .arg(format!("toyrce:{}", lang.to_string().to_lowercase()))
        .arg(paths.submission_container_path.to_str().unwrap())
        .arg(paths.input_container_path.to_str().unwrap())
        .output();

    timeout(Duration::from_secs(20), cmd).await?
}

struct FilePaths {
    input_host_path: PathBuf,
    input_container_path: PathBuf,
    submission_host_path: PathBuf,
    submission_container_path: PathBuf,
}

async fn get_file_paths(
    problem_id: &String,
    lang: &Language,
    input: String,
    submission: &String,
) -> Result<FilePaths, io::Error> {
    let mut input_host_path = std::env::temp_dir();
    input_host_path.push(&problem_id);
    input_host_path.set_extension("json");

    fs::write(&input_host_path, input).await?;

    let mut input_container_path = PathBuf::from(INPUTS_DIR);
    input_container_path.push(&problem_id);
    input_container_path.with_extension("json");

    let mut submission_host_path = std::env::temp_dir();
    submission_host_path.push(&problem_id);
    submission_host_path.set_extension(lang.get_extension());

    fs::write(&submission_host_path, submission).await?;

    let mut submission_container_path = PathBuf::from(SUBMISSIONS_DIR);
    submission_container_path.push(problem_id);
    submission_container_path.set_extension(lang.get_extension());

    return Ok(FilePaths {
        input_container_path,
        input_host_path,
        submission_host_path,
        submission_container_path,
    });
}
