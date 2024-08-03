package core

import (
	"gorm.io/gorm"
)

type App struct {
	DB     *gorm.DB
	Config Config
}

func (app *App) IsDev() bool {
	return app.Config.Environment == "dev"
}
