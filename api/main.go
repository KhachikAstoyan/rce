package main

import (
	"log"

	"github.com/KhachikAstoyan/toy-rce-api/apis"
	"github.com/KhachikAstoyan/toy-rce-api/core"
	"github.com/KhachikAstoyan/toy-rce-api/db"
	"github.com/KhachikAstoyan/toy-rce-api/queue"
)

func main() {
	config := core.LoadConfig()
	db := db.ConnectDB(&config)
	_, err := queue.GetMQConnection(&config)

	defer queue.CloseConnection()

	if err != nil {
		log.Fatal(err)
	}

	err = queue.InitializeQueues()

	if err != nil {
		log.Fatal(err)
	}

	app := core.App{
		DB:     db,
		Config: config,
	}

	e, err := apis.InitApi(&app)

	if err != nil {
		log.Fatal(err)
	}

	e.Logger.Fatal(e.Start(":8082"))
}
