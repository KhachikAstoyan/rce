mod executor;
mod language;

use axum::{routing::post, Router};
use log::info;
use tower_http::trace::{self, TraceLayer};
use tracing::Level;

const PORT: u32 = 8000;

extern crate pretty_env_logger;

#[tokio::main(flavor = "multi_thread")]
async fn main() {
    pretty_env_logger::init();

    let trace = TraceLayer::new_for_http()
        .make_span_with(trace::DefaultMakeSpan::new().level(Level::INFO))
        .on_response(trace::DefaultOnResponse::new().level(Level::INFO));

    let app = Router::new()
        .route("/", post(executor::execute_handler))
        .layer(trace);

    let listener = tokio::net::TcpListener::bind(format!("0.0.0.0:{PORT}"))
        .await
        .unwrap();
    info!("Server successfully start on port {PORT}");
    axum::serve(listener, app).await.unwrap()
}
