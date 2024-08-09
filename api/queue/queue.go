package queue

import (
	"encoding/json"
	"fmt"
	"sync"

	"github.com/KhachikAstoyan/toy-rce-api/core"
	"github.com/labstack/gommon/log"
	amqp "github.com/rabbitmq/amqp091-go"
)

type RabbitMQConnection struct {
	conn    *amqp.Connection
	channel *amqp.Channel
}

var (
	mqConn   *RabbitMQConnection
	mqOnce   sync.Once
	mqConfig *core.Config
)

const (
	SubmissionsQueue       = "submissions"
	SubmissionResultsQueue = "submission_results"
)

func CloseConnection() {
	mqConn.channel.Close()
	mqConn.conn.Close()
}

func GetMQConnection(config *core.Config) (*RabbitMQConnection, error) {
	var connErr error
	mqOnce.Do(func() {
		mqConfig = config

		url := fmt.Sprintf(
			"amqp://%s:%s@%s:%s/",
			config.Queue.User,
			config.Queue.Password,
			config.Queue.Host,
			config.Queue.Port,
		)

		conn, err := amqp.Dial(url)

		if err != nil {
			connErr = err
			return
		}

		ch, err := conn.Channel()

		if err != nil {
			connErr = err
			return
		}

		mqConn = &RabbitMQConnection{
			conn:    conn,
			channel: ch,
		}
	})

	if connErr != nil {
		return nil, connErr
	}

	return mqConn, nil
}

func InitializeQueues() error {
	_, err := mqConn.channel.QueueDeclare(
		SubmissionsQueue,
		true,
		false,
		false,
		false,
		nil,
	)

	if err != nil {
		return err
	}

	_, err = mqConn.channel.QueueDeclare(
		SubmissionResultsQueue,
		true,
		false,
		false,
		false,
		nil,
	)

	if err != nil {
		return err
	}

	return nil
}

func SendMessage(queueName string, message interface{}) error {
	conn, err := GetMQConnection(mqConfig)

	if err != nil {
		return err
	}

	messageBytes, err := json.Marshal(message)

	if err != nil {
		return err
	}

	err = conn.channel.Publish("", queueName, true, false, amqp.Publishing{
		ContentType: "application/json",
		Body:        messageBytes,
	})

	if err != nil {
		return err
	}

	return nil
}

type MessageHandlerFunc func(delivery amqp.Delivery) error

func ConsumeQueue(queueName string, messageHandler MessageHandlerFunc) error {
	msgs, err := mqConn.channel.Consume(
		queueName,
		"submissionResultsConsumer",
		true,
		false,
		false,
		false,
		nil,
	)

	if err != nil {
		return err
	}

	forever := make(chan bool)

	go func() {
		for d := range msgs {
			err := messageHandler(d)

			if err != nil {
				fmt.Println("Oops, something went wrong")
				fmt.Println(err.Error())
			}
		}
	}()

	log.Printf("[*] Waiting for messages")
	<-forever

	return nil
}
