mod executor;
mod language;

use std::collections::BTreeMap;

use amiquip::{
    Connection, ConsumerMessage, ConsumerOptions, Exchange, Publish, QueueDeclareOptions,
};
use executor::types::{ExecuteRequestPayload, SubmissionResult};
use log::error;
use tracing::info;

extern crate pretty_env_logger;

#[tokio::main]
async fn main() {
    pretty_env_logger::init();
    let mut connection = Connection::insecure_open("amqp://rabbitmq:rabbitmq@localhost:5672")
        .expect("Failed to connect to RabbitMQ");

    let channel = connection
        .open_channel(None)
        .expect("Failed to open a channel");

    let queue = channel
        .queue_declare(
            "submissions",
            QueueDeclareOptions {
                durable: true,
                exclusive: false,
                auto_delete: false,
                arguments: BTreeMap::new(),
            },
        )
        .expect("Failed to declare a queue");

    let exchange = Exchange::direct(&channel);

    // Start consuming messages
    let consumer = queue
        .consume(ConsumerOptions::default())
        .expect("Failed to start consuming messages");

    println!("Consuming");
    for message in consumer.receiver().iter() {
        match message {
            ConsumerMessage::Delivery(delivery) => {
                let body = String::from_utf8_lossy(&delivery.body);
                println!("Received message: {}", body);
                let payload: Result<ExecuteRequestPayload, serde_json::Error> =
                    serde_json::from_str(&body);

                let data = match payload {
                    Ok(p) => p,
                    Err(err) => {
                        println!("Couldn't parse payload {:?}", err);
                        error!("Couldn't parse payload");
                        delivery.reject(&channel, false).unwrap();
                        // TODO: mark the submission as invalid or something
                        // and send the result to the answer queue
                        //
                        continue;
                    }
                };
                let submission_id = data.submission_id.clone();

                info!("Parsed the message body");
                println!("Parsed the message body, starting code execution");
                let execution_result =
                    tokio::spawn(async move { executor::execute_handler(data).await.unwrap() })
                        .await;

                match execution_result {
                    Ok(mut result) => {
                        result.submission_id = Some(submission_id.clone());
                        let json = match serde_json::to_string(&result) {
                            Ok(str) => str,
                            Err(_) => SubmissionResult::error_json(submission_id),
                        };

                        // TODO: improve error handling
                        exchange
                            .publish(Publish::new(json.as_bytes(), "submission_results"))
                            .unwrap();
                    }
                    Err(_) => {
                        exchange
                            .publish(Publish::new(
                                SubmissionResult::error_json(submission_id).as_bytes(),
                                "submission_results",
                            ))
                            .unwrap();
                    }
                }
                delivery.ack(&channel).expect("Can't acknowledge");
            }
            _ => panic!("Unexpected message type"),
        }
    }
}
