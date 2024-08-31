package apis

import (
	"net/http"

	"github.com/KhachikAstoyan/toy-rce-api/core"
	"github.com/KhachikAstoyan/toy-rce-api/middleware"
	"github.com/KhachikAstoyan/toy-rce-api/services"
	"github.com/labstack/echo/v4"
)

func bindUsersApi(app *core.App, group *echo.Group) {
	authService := services.InitAuthService(app)
	userService := services.InitUserService(app)

	authorize := middleware.CreateAuthMiddleware(authService)
	usersApi := usersApi{app, userService}
	subGroup := group.Group("/users")

	subGroup.GET("/me", usersApi.me, authorize())
}

type usersApi struct {
	app         *core.App
	service *services.UserService
}

func (api *usersApi) me(c echo.Context) error {
	id := c.Get("userId").(string)

	if id == "" {
		return echo.ErrUnauthorized
	}

	user, err := api.service.GetUserWithPermissions(id)

	if err != nil {
		return err
	}

	return c.JSON(http.StatusOK, user)
}
