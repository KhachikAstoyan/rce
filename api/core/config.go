package core

import (
	"log"

	"github.com/joho/godotenv"
	"github.com/kelseyhightower/envconfig"
)

type Config struct {
	DB struct {
		Username string `envconfig:"DB_USERNAME" required:"true"`
		Host     string `envconfig:"DB_HOST" required:"true"`
		Password string `envconfig:"DB_PASSWORD" required:"true"`
		Name     string `envconfig:"DB_NAME" required:"true"`
		Port     string `envconfig:"DB_PORT" required:"true"`
	}
	Queue struct {
		Host     string `envconfig:"QUEUE_HOST" required:"true"`
		Port     string `envconfig:"QUEUE_PORT" required:"true"`
		User     string `envconfig:"QUEUE_USER" required:"true"`
		Password string `envconfig:"QUEUE_PASSWORD" required:"true"`
	}
	ServerURL      string `envconfig:"SERVER_URL"`
	Domain         string `envConfig:"SERVER_DOMAIN"`
	ClientURL      string `envconfig:"CLIENT_URL" required:"true"`
	DevExecutorURL string `envconfig:"DEV_EXECUTOR_URL" required:"true"`
	Environment    string `envconfig:"ENVIRONMENT" required:"true"` // prod or dev
	Auth           struct {
		JwtAccessSecret  string `envconfig:"JWT_ACCESS_SECRET" required:"true"`
		JwtRefreshSecret string `envconfig:"JWT_REFRESH_SECRET" required:"true"`
		GcpClientID      string `envconfig:"GCP_CLIENT_ID" required:"true"`
		GcpClientSecret  string `envconfig:"GCP_CLIENT_SECRET" required:"true"`
	}
}

func LoadConfig() Config {
	var config Config

	err := godotenv.Load()
	if err != nil {
		log.Println("Failed to read .env file")
	}

	if err := envconfig.Process("", &config); err != nil {
		log.Fatal(err)
	}

	return config
}
