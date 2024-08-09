package apis

import (
	"github.com/KhachikAstoyan/toy-rce-api/core"
	customMiddleware "github.com/KhachikAstoyan/toy-rce-api/middleware"
	"github.com/KhachikAstoyan/toy-rce-api/services"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func InitApi(app *core.App) (*echo.Echo, error) {
	e := echo.New()

	// e.Use(middleware.Logger())
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins:     []string{app.Config.ClientURL},
		AllowHeaders:     []string{echo.HeaderOrigin, echo.HeaderContentType, echo.HeaderAccept, echo.HeaderAuthorization},
		AllowCredentials: true,
	}))

	api := e.Group("")
	api.Use(customMiddleware.ExtractTokenMiddleware(services.InitAuthService(app)))

	bindProblemsApi(app, api)
	bindAuthApi(app, api)
	bindUsersApi(app, api)
	bindSubmissionsApi(app, api)

	return e, nil
}
