use crate::executor::types::SubmissionResult;
use crate::language::Language;
use log::info;
use std::{error, str};
use std::{io, path::PathBuf, process::Output, time::Duration};
use tokio::time::timeout;
use tokio::{fs, process::Command};

use super::types::TestSuite;

// directories inside the docker container
const INPUTS_DIR: &str = "/app/inputs";
const SUBMISSIONS_DIR: &str = "/app/submissions";
const SKELETONS_DIR: &str = "/app/skeletons";

pub async fn test_solution(
    lang: Language,
    code: String,
    skeleton: String,
    tests: TestSuite,
) -> Result<SubmissionResult, Box<dyn error::Error>> {
    info!("Testing solution {:?}", tests);
    info!(target: "solution", "solution {}", code);
    info!(target: "skeleton", "skeleton {}", skeleton);
    info!("Tests {:?}", tests);

    let json = serde_json::to_string(&tests)?;
    info!("Creating paths");
    let paths = get_file_paths(&tests.problem_id, &lang, json, &code, &skeleton).await?;

    info!("Formed paths for host and container");
    info!(target: "paths", "{:?}", paths);

    let container_output = run_docker_container(&paths, &lang).await?;
    let stdout = str::from_utf8(&container_output.stdout).unwrap_or_default();

    info!("Finished running docker container");
    info!(
        target: "docker:stdout",
        "{:?}",
        stdout
    );
    info!(
        target: "docker:stderr",
        "{:?}",
        str::from_utf8(&container_output.stderr).unwrap_or_default()
    );

    let submission_results: SubmissionResult = serde_json::from_str(&stdout)?;

    return Ok(submission_results);
}

async fn run_docker_container(paths: &FilePaths, lang: &Language) -> Result<Output, io::Error> {
    info!("Running docker container");
    let mut com = Command::new("docker");

    com.arg("run")
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
        .arg("-v")
        .arg(format!(
            "{}:/{}:ro",
            paths.skeleton_host_path.to_str().unwrap(),
            paths.skeleton_container_path.to_str().unwrap()
        ))
        .arg(format!("toyrce:{}", lang.to_string().to_lowercase()))
        .arg(paths.skeleton_container_path.to_str().unwrap())
        .arg(paths.submission_container_path.to_str().unwrap())
        .arg(paths.input_container_path.to_str().unwrap());

    info!(target: "XERS KERELES", "{:?}", com);

    timeout(Duration::from_secs(20), com.output()).await?
}

#[derive(Debug)]
struct FilePaths {
    input_host_path: PathBuf,
    input_container_path: PathBuf,
    submission_host_path: PathBuf,
    submission_container_path: PathBuf,
    skeleton_host_path: PathBuf,
    skeleton_container_path: PathBuf,
}

async fn get_file_paths(
    problem_id: &String,
    lang: &Language,
    input: String,
    submission: &String,
    skeleton: &String,
) -> Result<FilePaths, io::Error> {
    let mut input_host_path = std::env::temp_dir();
    input_host_path.push(&problem_id);
    input_host_path.set_extension("json");

    info!("Writing inputs to file");
    fs::write(&input_host_path, input).await?;

    let mut input_container_path = PathBuf::from(INPUTS_DIR);
    input_container_path.push(&problem_id);
    input_container_path.with_extension("json");

    let mut submission_host_path = std::env::temp_dir();
    submission_host_path.push(&problem_id);
    submission_host_path.set_extension(lang.get_extension());

    info!("Writing submission to file");
    fs::write(&submission_host_path, submission).await?;

    let mut submission_container_path = PathBuf::from(SUBMISSIONS_DIR);
    submission_container_path.push(problem_id);
    submission_container_path.set_extension(lang.get_extension());

    let mut skeleton_host_path = std::env::temp_dir();
    skeleton_host_path.push("skeletons");

    fs::create_dir_all(&skeleton_host_path).await?;

    skeleton_host_path.push(format!("{}.skeleton", &problem_id));
    skeleton_host_path.set_extension(lang.get_extension());

    let mut skeleton_container_path = PathBuf::from(SKELETONS_DIR);
    skeleton_container_path.push(format!("{}.submission", problem_id));
    skeleton_container_path.set_extension(lang.get_extension());

    info!(
        "Writing skeleton to file {:?}",
        skeleton_host_path.to_str().unwrap_or_default()
    );
    fs::write(&skeleton_host_path, skeleton).await?;
    info!("Finished writing files");

    let paths = FilePaths {
        input_container_path,
        input_host_path,
        submission_host_path,
        submission_container_path,
        skeleton_host_path,
        skeleton_container_path,
    };

    return Ok(paths);
}
