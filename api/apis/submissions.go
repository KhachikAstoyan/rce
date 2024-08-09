package apis

import (
	"net/http"

	"github.com/KhachikAstoyan/toy-rce-api/core"
	"github.com/KhachikAstoyan/toy-rce-api/dtos"
	"github.com/KhachikAstoyan/toy-rce-api/middleware"
	"github.com/KhachikAstoyan/toy-rce-api/models"
	"github.com/KhachikAstoyan/toy-rce-api/services"
	"github.com/KhachikAstoyan/toy-rce-api/services/executor"
	"github.com/labstack/echo/v4"
)

func bindSubmissionsApi(app *core.App, group *echo.Group) {
	api := submissionsApi{app}
	authService := services.InitAuthService(app)
	authorize := middleware.CreateAuthMiddleware(authService)

	subGroup := group.Group("/submissions")

	subGroup.POST("", api.create, authorize())
	subGroup.GET("/:id", api.status, authorize())
	subGroup.POST("/:id", api.postSubmissionResult, authorize("write:submission"))
	subGroup.DELETE("/:id", api.delete, authorize("write:submission"))

}

type submissionsApi struct {
	app *core.App
}

func (api *submissionsApi) status(c echo.Context) error {
	db := api.app.DB

	id := c.Param("id")
	var submission models.Submission

	if err := db.Where("id = ?", id).First(&submission).Error; err != nil {
		return echo.NewHTTPError(http.StatusNotFound, "submission not foudn")
	}

	if submission.Status == "pending" || submission.Status == "" {
		return c.JSON(http.StatusProcessing, dtos.PendingSubmissionResponse{
			Status: "pending",
		})
	}

	return c.JSON(http.StatusOK, submission)
}

func (api *submissionsApi) create(c echo.Context) error {
	db := api.app.DB

	p := new(dtos.CreateSubmissionDto)

	if err := c.Bind(p); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "couldn't parse request body")
	}

	var problem models.Problem
	var test models.Test

	if err := db.Where("id = ?", p.ProblemID).First(&problem).Error; err != nil {
		return echo.NewHTTPError(http.StatusNotFound, "problem not found")
	}

	if err := db.Where("language = ?", p.Language).First(&test).Error; err != nil {
		return echo.NewHTTPError(http.StatusNotFound, "language not supported")
	}

	submission := models.Submission{
		Problem:  problem,
		Solution: p.Solution,
		Language: p.Language,
		UserID:   c.Get("userId").(string),
		Status:   "pending",
	}

	if err := db.Create(&submission).Error; err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "couldn't create submission")
	}

	err := executor.TestSubmissionDev(&submission, &test)

	if err != nil {
		return echo.NewHTTPError(http.StatusServiceUnavailable, "code execution failed")
	}

	return c.JSON(http.StatusAccepted, dtos.CreateSubmissionResponse{
		ID: submission.ID,
	})
}

func (api *submissionsApi) postSubmissionResult(c echo.Context) error {
	db := api.app.DB

	id := c.Param("id")
	p := new(dtos.PostSubmissionResultsDto)

	if err := c.Bind(p); err != nil || id == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "couldn't parse request body")
	}

	var submission models.Submission

	if err := db.Where("id = ?", id).First(&submission).Error; err != nil {
		return echo.NewHTTPError(http.StatusNotFound, "submission not found")
	}

	submission.Results = p.Results

	if p.Results.Success {
		submission.Status = "completed"
	} else {
		submission.Status = "failed"
	}

	if err := db.Save(&submission).Error; err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "error saving submission results")
	}

	return c.NoContent(http.StatusOK)
}

func (api *submissionsApi) delete(c echo.Context) error {
	db := api.app.DB
	id := c.Param("id")
	if id == "" {
		return echo.ErrBadRequest
	}

	if err := db.Where("id = ?", id).Delete(&models.Submission{}).Error; err != nil {
		return echo.NewHTTPError(http.StatusNotFound, "couldn't delete submission")
	}

	return c.NoContent(http.StatusOK)
}
