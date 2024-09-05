use std::sync::Arc;

use amqprs::{
    channel::{
        BasicCancelArguments, BasicConsumeArguments, BasicNackArguments, BasicPublishArguments,
        Channel, ConsumerMessage, QueueDeclareArguments,
    },
    connection::{Connection, OpenConnectionArguments},
    BasicProperties,
};
use executor::types::{ExecuteRequestPayload, SubmissionResult};
use log::error;
use tokio::sync::Mutex;

mod executor;
mod language;

#[tokio::main(flavor = "multi_thread")]
async fn main() {
    let connection_args = OpenConnectionArguments::new("localhost", 5672, "rabbitmq", "rabbitmq");
    let connection = Connection::open(&connection_args)
        .await
        .expect("Connection failed");
    let channel = connection
        .open_channel(None)
        .await
        .expect("Failed to open channel");

    let channel = Arc::new(Mutex::new(channel));

    let _ = channel
        .lock()
        .await
        .queue_declare(QueueDeclareArguments::durable_client_named("submissions"))
        .await
        .expect("Failed to declare queue");
    let _ = channel
        .lock()
        .await
        .queue_declare(QueueDeclareArguments::durable_client_named(
            "submission_results",
        ))
        .await
        .expect("Failed to declare queue");

    let consumer_args = BasicConsumeArguments::new("submissions", "submissions");
    let (ctag, mut consumer) = channel
        .lock()
        .await
        .basic_consume_rx(consumer_args)
        .await
        .expect("Failed to create consumer");

    loop {
        while let Some(delivery) = consumer.recv().await {
            println!("RECEIVED MESSAGE");

            let channel = channel.clone();
            let _ = tokio::spawn(async move {
                handle_message(&delivery, channel).await;
            });
        }

        // this is what to do when we get a nerror
        if let Err(e) = channel
            .lock()
            .await
            .basic_cancel(BasicCancelArguments::new(&ctag))
            .await
        {
            println!("error {}", e.to_string());
        };
    }
    // println!("Finished?");
}

async fn handle_message(delivery: &ConsumerMessage, channel: Arc<Mutex<Channel>>) {
    println!("HANDLING MESSAGE");
    let content = delivery.content.clone().unwrap();
    let body = String::from_utf8_lossy(&content);
    let payload: Result<ExecuteRequestPayload, serde_json::Error> = serde_json::from_str(&body);

    let data = match payload {
        Ok(p) => p,
        Err(err) => {
            println!("Couldn't parse payload {:?}", err);
            error!("Couldn't parse payload");
            return;
            // TODO: reject delivery

            // TODO: mark the submission as invalid or something
            // and send the result to the answer queue
        }
    };

    let submission_id = data.submission_id.clone();
    let mut result = executor::execute_handler(data).await;
    println!("GOT RESULT ");

    result.submission_id = Some(submission_id.clone());
    let json = match serde_json::to_string(&result) {
        Ok(str) => str,
        Err(_) => SubmissionResult::error_json(submission_id),
    };
    let args = BasicNackArguments::new(
        delivery.deliver.as_ref().unwrap().delivery_tag(),
        false,
        false,
    );
    let _ = channel.lock().await.basic_nack(args).await;

    println!("we have the json, publishing to submission_results");

    let publish_properties = BasicProperties::default();
    let publish_arguments = BasicPublishArguments::new("", "submission_results");
    channel
        .lock()
        .await
        .basic_publish(
            publish_properties,
            json.as_bytes().to_vec(),
            publish_arguments,
        )
        .await
        .unwrap();

    println!("");
}
