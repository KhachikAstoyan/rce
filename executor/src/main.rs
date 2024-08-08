mod executor;
mod language;

// use axum::{routing::post, Router};
// use log::info;
// use tower_http::trace::{self, TraceLayer};
// use tracing::Level;

// const PORT: u32 = 8000;

// extern crate pretty_env_logger;

// #[tokio::main(flavor = "multi_thread")]
// async fn main() {
//     pretty_env_logger::init();

//     let trace = TraceLayer::new_for_http()
//         .make_span_with(trace::DefaultMakeSpan::new().level(Level::INFO))
//         .on_response(trace::DefaultOnResponse::new().level(Level::INFO));

//     let app = Router::new()
//         .route("/", post(executor::execute_handler))
//         .layer(trace);

//     let listener = tokio::net::TcpListener::bind(format!("0.0.0.0:{PORT}"))
//         .await
//         .unwrap();
//     info!("Server successfully start on port {PORT}");
//     axum::serve(listener, app).await.unwrap()
// }

use core::str;

use amqprs::{
    channel::{BasicCancelArguments, BasicConsumeArguments, QueueDeclareArguments},
    connection::{Connection, OpenConnectionArguments},
};

#[tokio::main(flavor = "multi_thread")]
async fn main() {
    let args = OpenConnectionArguments::new("localhost", 5672, "rabbitmq", "rabbitmq");
    let connection = Connection::open(&args).await.unwrap();
    let channel = connection.open_channel(None).await.unwrap();

    let (queue_name, _, _) = channel
        .queue_declare(QueueDeclareArguments::new("submissions"))
        .await
        .unwrap()
        .unwrap();
    let consumer_args = BasicConsumeArguments::new(&queue_name, "basic_consumer")
        .manual_ack(false)
        .finish();
    let (ctag, mut messages_rx) = channel.basic_consume_rx(consumer_args).await.unwrap();

    // you will need to run this in `tokio::spawn` or `tokio::task::spawn_blocking`
    // if you want to do other things in parallel of message consumption.
    while let Some(msg) = messages_rx.recv().await {
        println!("{:?}", str::from_utf8(&msg.content.unwrap()).unwrap())
    }

    // Only needed when `messages_rx.recv().await` hasn't yet returned `None`
    if let Err(e) = channel.basic_cancel(BasicCancelArguments::new(&ctag)).await {
        // handle err
    };

    channel.close().await.unwrap();
    connection.close().await.unwrap();
}
