package apis

import (
	"errors"
	"net/http"

	"github.com/KhachikAstoyan/toy-rce-api/core"
	"github.com/KhachikAstoyan/toy-rce-api/dtos"
	"github.com/KhachikAstoyan/toy-rce-api/middleware"
	"github.com/KhachikAstoyan/toy-rce-api/models"
	"github.com/KhachikAstoyan/toy-rce-api/services"
	"github.com/KhachikAstoyan/toy-rce-api/utils"
	"github.com/labstack/echo/v4"
	"gorm.io/gorm"
)

func bindPermissionsApi(app *core.App, group *echo.Group) {
	authService := services.InitAuthService(app)
	permissionsApi := permissionsApi{app, authService}
	authorize := middleware.CreateAuthMiddleware(authService)

	subGroup := group.Group("/permissions")

	subGroup.GET("", permissionsApi.list, authorize("read:permission"))
	subGroup.POST("", permissionsApi.create, authorize("write:permission"))
	subGroup.PUT("/:id", permissionsApi.update, authorize("write:permission"))
	subGroup.DELETE("/:id", permissionsApi.delete, authorize("write:permission"))
}

type permissionsApi struct {
	app         *core.App
	authService *services.AuthService
}

func (api *permissionsApi) list(c echo.Context) error {
	db := api.app.DB
	var permissions []models.Permission

	if err := db.Scopes(utils.Paginate(&c)).Find(&permissions).Error; err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "permissions not found")
	}

	return c.JSON(http.StatusOK, permissions)
}

func (api *permissionsApi) create(c echo.Context) error {
	db := api.app.DB
	p := new(dtos.CreatePermissionDto)

	if err := c.Bind(p); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "failed to parse body")
	}

	permission := models.Permission{
		Name: p.Name,
	}

	if err := db.Create(&permission).Error; err != nil {
		if errors.Is(err, gorm.ErrDuplicatedKey) {
			return echo.NewHTTPError(http.StatusConflict, "permission already exists")
		}

		return echo.NewHTTPError(http.StatusInternalServerError, "failed to create permission")
	}

	return c.JSON(http.StatusCreated, permission)
}

func (api *permissionsApi) update(c echo.Context) error {
	db := api.app.DB
	id := c.Param("id")
	p := new(dtos.CreatePermissionDto)
	var permission models.Permission

	if err := c.Bind(p); err != nil || id == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "failed to parse body")
	}

	if err := db.Where("id = ?", id).First(&permission).Error; err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "something went wrong")
	}

	if p.Name != permission.Name {
		permission.Name = p.Name
	}

	if err := db.Save(&permission).Error; err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "couldnt update permission")
	}

	return c.NoContent(http.StatusAccepted)

}

func (api *permissionsApi) delete(c echo.Context) error {
	db := api.app.DB
	id := c.Param("id")

	if id == "" {
		return echo.ErrBadRequest
	}

	if err := db.Where("id = ?", id).Delete(&models.Permission{}).Error; err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "couldnt delete permission")
	}

	return c.NoContent(http.StatusOK)
}
