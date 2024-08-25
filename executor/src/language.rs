use core::fmt;
use once_cell::sync::Lazy;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Clone, PartialEq, Eq, Hash, Deserialize, Serialize, Debug)]
pub enum Language {
    #[serde(rename = "javascript")]
    Javascript,
    #[serde(rename = "python")]
    Python,
    #[serde(rename = "java")]
    Java,
    #[serde(rename = "typescript")]
    Typescript,

    // #[serde(rename = "rust")]
    // Rust,
}

impl Language {
    pub fn get_extension(&self) -> String {
        LANGUAGE_EXTENSIONS.get(&self).unwrap_or(&"").to_string()
    }
}

impl fmt::Display for Language {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{:?}", self)
    }
}

static LANGUAGE_EXTENSIONS: Lazy<HashMap<Language, &'static str>> = Lazy::new(|| {
    HashMap::from([
        (Language::Javascript, "js"),
        (Language::Python, "py"),
        // (Language::Rust, "rs"),
        // (Language::Typescript, "ts"),
        // (Language::Go, "go"),
        // (Language::C, "c"),
        // (Language::Cpp, "cpp"),
        // (Language::Java, "java"),
        // (Language::Bash, "sh"),
    ])
});

// static LANGUAGE_FILE_NAMES: Lazy<HashMap<Language, &'static str>> =
//     Lazy::new(|| HashMap::from([(Language::Java, "Main")]));
