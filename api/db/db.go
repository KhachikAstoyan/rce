package db

import (
	"fmt"
	"log"
	"net"
	"net/url"
	"time"

	"github.com/KhachikAstoyan/toy-rce-api/core"
	"github.com/KhachikAstoyan/toy-rce-api/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func ConnectDB(conf *core.Config) *gorm.DB {
	raw_connect(conf.DB.Host, []string{conf.DB.Port})

	dsn := url.URL{
		User:     url.UserPassword(conf.DB.Username, conf.DB.Password),
		Scheme:   "postgres",
		Host:     fmt.Sprintf("%s:%s", conf.DB.Host, conf.DB.Port),
		Path:     conf.DB.Name,
		RawQuery: (&url.Values{"sslmode": []string{"disable"}}).Encode(),
	}

	conn, err := gorm.Open(postgres.Open(dsn.String()), &gorm.Config{
		// Logger: newLogger,
	})

	if err != nil {
		log.Fatal(err)
	}

	conn.AutoMigrate(
		&models.Problem{},
		&models.Test{},
		&models.Submission{},
		&models.User{},
		&models.Profile{},
		&models.RefreshToken{},
		&models.Permission{},
		&models.Role{},
		&models.Skeleton{},
		&models.SolutionTemplate{},
	)

	return conn
}

func raw_connect(host string, ports []string) {
	for _, port := range ports {
		timeout := time.Second
		conn, err := net.DialTimeout("tcp", net.JoinHostPort(host, port), timeout)
		if err != nil {
			fmt.Println("Connecting error:", err)
		}
		if conn != nil {
			defer conn.Close()
			fmt.Println("Opened", net.JoinHostPort(host, port))
		}
	}
}
