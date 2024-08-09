mod executor;
mod language;

use std::collections::BTreeMap;

use amiquip::{Connection, ConsumerMessage, ConsumerOptions, FieldTable, QueueDeclareOptions};

fn main() {
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

    // Start consuming messages
    let consumer = queue
        .consume(ConsumerOptions::default())
        .expect("Failed to start consuming messages");

    for message in consumer.receiver().iter() {
        match message {
            ConsumerMessage::Delivery(delivery) => {
                let body = String::from_utf8_lossy(&delivery.body);
                println!("Received message: {}", body);
                // Process the message as needed
                delivery
                    .ack(&channel)
                    .expect("Failed to acknowledge message");
            }
            _ => panic!("Unexpected message type"),
        }
    }
}
