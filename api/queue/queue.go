package queue

import (
	"encoding/json"
	"fmt"
	"sync"

	"github.com/KhachikAstoyan/toy-rce-api/core"
	ampq "github.com/rabbitmq/amqp091-go"
)

type RabbitMQConnection struct {
	conn    *ampq.Connection
	channel *ampq.Channel
}

var (
	mqConn   *RabbitMQConnection
	mqOnce   sync.Once
	mqConfig *core.Config
)

const (
	SubmissionsQueue = "submissions"
)

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

		conn, err := ampq.Dial(url)

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

func SendMessage(queueName string, message interface{}) error {
	conn, err := GetMQConnection(mqConfig)

	if err != nil {
		return err
	}

	_, err = conn.channel.QueueDeclare(
		queueName,
		true,
		false,
		false,
		false,
		nil,
	)

	if err != nil {
		return err
	}

	messageBytes, err := json.Marshal(message)

	if err != nil {
		return err
	}

	err = conn.channel.Publish("", queueName, true, false, ampq.Publishing{
		ContentType: "application/json",
		Body:        messageBytes,
	})

	if err != nil {
		return err
	}

	return nil
}
