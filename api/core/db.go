package core

import (
	"log"
	"net/url"
	"os"
	"time"

	"github.com/KhachikAstoyan/toy-rce-api/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

func ConnectDB(conf *Config) *gorm.DB {
	newLogger := logger.New(
		log.New(os.Stdout, "\r\n", log.LstdFlags), // io writer
		logger.Config{
			SlowThreshold:             time.Second,  // Slow SQL threshold
			LogLevel:                  logger.Info, // Log level
			IgnoreRecordNotFoundError: true,         // Ignore ErrRecordNotFound error for logger
			ParameterizedQueries:      true,         // Don't include params in the SQL log
			Colorful:                  true,         // Disable color
		},
	)

	dsn := url.URL{
		User:     url.UserPassword(conf.DB.Username, conf.DB.Password),
		Scheme:   "postgres",
		Host:     conf.DB.Host,
		Path:     conf.DB.Name,
		RawQuery: (&url.Values{"sslmode": []string{"disable"}}).Encode(),
	}

	conn, err := gorm.Open(postgres.Open(dsn.String()), &gorm.Config{
		Logger: newLogger,
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
	)

	return conn
}
