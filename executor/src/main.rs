use amqprs::{
    channel::{BasicConsumeArguments, BasicPublishArguments, Channel, QueueDeclareArguments},
    connection::{Connection, OpenConnectionArguments},
    BasicProperties,
};
use executor::types::{ExecuteRequestPayload, SubmissionResult};
use log::error;

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

    let _ = channel
        .queue_declare(QueueDeclareArguments::durable_client_named("submissions"))
        .await
        .expect("Failed to declare queue");
    let _ = channel
        .queue_declare(QueueDeclareArguments::durable_client_named(
            "submission_results",
        ))
        .await
        .expect("Failed to declare queue");

    let consumer_args = BasicConsumeArguments::new("submissions", "submissions");
    let (_, mut consumer) = channel
        .basic_consume_rx(consumer_args)
        .await
        .expect("Failed to create consumer");

    loop {
        while let Some(delivery) = consumer.recv().await {
            println!("RECEIVED MESSAGE");
            if let Some(msg) = delivery.content {
                let channel = channel.clone();
                let _ = tokio::spawn(async move {
                    handle_message(msg, &channel).await;
                })
                .await;
            }
        }
    }
    // println!("Finished?");
}

async fn handle_message(message: Vec<u8>, channel: &Channel) {
    println!("HANDLING MESSAGE");
    let body = String::from_utf8_lossy(&message);
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
    println!("GOT RESULT {:?}", result);

    result.submission_id = Some(submission_id.clone());
    let json = match serde_json::to_string(&result) {
        Ok(str) => str,
        Err(_) => SubmissionResult::error_json(submission_id),
    };

    let publish_properties = BasicProperties::default();
    let publish_arguments = BasicPublishArguments::new("submission_results", "submission_results");
    channel
        .basic_publish(
            publish_properties,
            json.as_bytes().to_vec(),
            publish_arguments,
        )
        .await
        .unwrap();
}
// use std::collections::BTreeMap;
//
// use amiquip::{
//     Connection, ConsumerMessage, ConsumerOptions, Exchange, Publish, QueueDeclareOptions,
// };
// use executor::types::{ExecuteRequestPayload, SubmissionResult};
// use log::error;
//
// extern crate pretty_env_logger;
//
// #[tokio::main]
// async fn main() {
//     pretty_env_logger::init();
//     let mut connection = Connection::insecure_open("amqp://rabbitmq:rabbitmq@localhost:5672")
//         .expect("Failed to connect to RabbitMQ");
//
//     let channel = connection
//         .open_channel(None)
//         .expect("Failed to open a channel");
//
//     let queue = channel
//         .queue_declare(
//             "submissions",
//             QueueDeclareOptions {
//                 durable: true,
//                 exclusive: false,
//                 auto_delete: false,
//                 arguments: BTreeMap::new(),
//             },
//         )
//         .expect("Failed to declare a queue");
//
//     let exchange = Exchange::direct(&channel);
//
//     // Start consuming messages
//     let consumer = queue
//         .consume(ConsumerOptions::default())
//         .expect("Failed to start consuming messages");
//
//     println!("Consuming");
//     for message in consumer.receiver().iter() {
//         match message {
//             ConsumerMessage::Delivery(delivery) => {
//                 let body = String::from_utf8_lossy(&delivery.body);
//                 let payload: Result<ExecuteRequestPayload, serde_json::Error> =
//                     serde_json::from_str(&body);
//
//                 let data = match payload {
//                     Ok(p) => p,
//                     Err(err) => {
//                         println!("Couldn't parse payload {:?}", err);
//                         error!("Couldn't parse payload");
//                         delivery.reject(&channel, false).unwrap();
//                         // TODO: mark the submission as invalid or something
//                         // and send the result to the answer queue
//                         //
//                         continue;
//                     }
//                 };
//                 let submission_id = data.submission_id.clone();
//
//                 let execution_result =
//                     tokio::spawn(async move { executor::execute_handler(data).await }).await;
//
//                 match execution_result {
//                     Ok(mut result) => {
//                         result.submission_id = Some(submission_id.clone());
//                         let json = match serde_json::to_string(&result) {
//                             Ok(str) => str,
//                             Err(_) => SubmissionResult::error_json(submission_id),
//                         };
//
//                         // TODO: improve error handling
//                         exchange
//                             .publish(Publish::new(json.as_bytes(), "submission_results"))
//                             .unwrap();
//                     }
//                     Err(_) => {
//                         exchange
//                             .publish(Publish::new(
//                                 SubmissionResult::error_json(submission_id).as_bytes(),
//                                 "submission_results",
//                             ))
//                             .unwrap();
//                     }
//                 }
//                 delivery.ack(&channel).expect("Can't acknowledge");
//             }
//             _ => panic!("Unexpected message type"),
//         }
//     }
// }
