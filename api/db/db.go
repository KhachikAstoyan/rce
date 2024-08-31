package db

import (
	"context"
	"fmt"
  "time"
	"log"
	"net/url"

	"github.com/KhachikAstoyan/toy-rce-api/core"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/jackc/pgx/v5/stdlib"
	"github.com/jmoiron/sqlx"
)

func ConnectDB(conf *core.Config) *sqlx.DB {
	connURL := buildConnectionURL(conf.DB.Username, conf.DB.Password, conf.DB.Host, conf.DB.Port, conf.DB.Name)
  poolConfig, err := pgxpool.ParseConfig(connURL)
  
  if err != nil {
    log.Fatalf("Unable to parse connection string %v\n", err)
  }

  poolConfig.MaxConns = 10
  poolConfig.MinConns = 2
  poolConfig.MaxConnLifetime = time.Hour
  poolConfig.MaxConnIdleTime = 30 * time.Minute

  pool, err := pgxpool.NewWithConfig(context.Background(), poolConfig)

  if err != nil {
    log.Fatalf("Unable to create connection pool: %v\n", err)
  }

  stdDB := stdlib.OpenDBFromPool(pool)
  db := sqlx.NewDb(stdDB, "pgx") 

	return db 

	// dsn := url.URL{
	// 	User:     url.UserPassword(conf.DB.Username, conf.DB.Password),
	// 	Scheme:   "postgres",
	// 	Host:     fmt.Sprintf("%s:%s", conf.DB.Host, conf.DB.Port),
	// 	Path:     conf.DB.Name,
	// 	RawQuery: (&url.Values{"sslmode": []string{"disable"}}).Encode(),
	// }
	//
	// newLogger := logger.New(
	// 	log.New(os.Stdout, "\r\n", log.LstdFlags), // io writer
	// 	logger.Config{
	// 		SlowThreshold:             time.Second,   // Slow SQL threshold
	// 		LogLevel:                  logger.Silent, // Log level
	// 		IgnoreRecordNotFoundError: true,          // Ignore ErrRecordNotFound error for logger
	// 		ParameterizedQueries:      true,          // Don't include params in the SQL log
	// 		Colorful:                  false,         // Disable color
	// 	},
	// )
	//
	// conn, err := gorm.Open(postgres.Open(dsn.String()), &gorm.Config{
	// 	Logger: newLogger,
	// })
	//
	// if err != nil {
	// 	log.Fatal(err)
	// }
	//
	// conn.AutoMigrate(
	// 	&models.Problem{},
	// 	&models.Test{},
	// 	&models.Submission{},
	// 	&models.User{},
	// 	&models.Profile{},
	// 	&models.RefreshToken{},
	// 	&models.Permission{},
	// 	&models.Role{},
	// 	&models.Skeleton{},
	// 	&models.SolutionTemplate{},
	// )

	// return conn
}

func buildConnectionURL(username, password, host, port, dbName string) string {
	escapedPass := url.QueryEscape(password)

	connectionURL := fmt.Sprintf("postgres://%s:%s@%s:%s/%s",
		username, escapedPass, host, port, dbName)

	return connectionURL
}
