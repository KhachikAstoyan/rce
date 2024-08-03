package main

import (
	"log"

	"github.com/KhachikAstoyan/toy-rce-api/apis"
	"github.com/KhachikAstoyan/toy-rce-api/core"
)

func main() {
	config := core.LoadConfig()
	db := core.ConnectDB(&config)

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
