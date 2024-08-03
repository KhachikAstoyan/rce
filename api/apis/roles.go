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

func bindRolesApi(app *core.App, group *echo.Group) {
	rolesApi := rolesApi{app}
	authService := services.InitAuthService(app)
	authorize := middleware.CreateAuthMiddleware(authService)

	subGroup := group.Group("/roles")
	subGroup.GET("", rolesApi.list, authorize("read:role"))
	subGroup.POST("", rolesApi.create, authorize("write:role"))
	subGroup.POST("/:id/permissions", rolesApi.associatePermission, authorize("write:role", "write:permission"))
	subGroup.DELETE("/:id/", rolesApi.delete, authorize("write:role"))
}

type rolesApi struct {
	app *core.App
}

func (api *rolesApi) list(c echo.Context) error {
	db := api.app.DB
	var roles []models.Role

	if err := db.Scopes(utils.Paginate(&c)).Preload("Permissions").Find(&roles).Error; err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "permissions not found")
	}

	return c.JSON(http.StatusOK, roles)
}

func (api *rolesApi) create(c echo.Context) error {
	db := api.app.DB
	p := new(dtos.CreateRoleDto)

	if err := c.Bind(p); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "failed to parse body")
	}

	role := models.Role{
		Name:        p.Name,
		Description: p.Description,
	}

	if err := db.Create(&role).Error; err != nil {
		if errors.Is(err, gorm.ErrDuplicatedKey) {
			return echo.NewHTTPError(http.StatusConflict, "role already exists")
		}

		return echo.NewHTTPError(http.StatusInternalServerError, "failed to create role")
	}

	return c.JSON(http.StatusCreated, role)
}

func (api *rolesApi) delete(c echo.Context) error {
	db := api.app.DB
	id := c.Param("id")

	if err := db.Where("id = ?", id).Delete(&models.Role{}).Error; err != nil {
		return echo.ErrNotFound
	}

	return c.NoContent(http.StatusOK)
}

func (api *rolesApi) associatePermission(c echo.Context) error {
	db := api.app.DB
	roleId := c.Param("id")
	var role models.Role

	p := new(dtos.AssociatePermissionsDto)

	if roleId == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "no id")
	}

	if err := c.Bind(p); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "failed to parse body")
	}

	if err := db.First(&role, roleId).Error; err != nil {
		return echo.NewHTTPError(http.StatusNotFound, "role not found")
	}

	var permissions []models.Permission

	if err := db.Where("id IN ?", p.Permissions).Find(&permissions).Error; err != nil {
		return echo.NewHTTPError(http.StatusNotFound, "no permissions found")
	}

	if err := db.Model(&role).Association("Permissions").Append(&permissions); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Couldnt associate permissions with role")
	}

	return c.NoContent(http.StatusOK)
}
