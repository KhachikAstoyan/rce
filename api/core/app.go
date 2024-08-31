package core

import "github.com/jmoiron/sqlx"

type App struct {
	DB     *sqlx.DB
	Config Config
}

func (app *App) IsDev() bool {
	return app.Config.Environment == "dev"
}
