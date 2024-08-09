package apis

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"github.com/KhachikAstoyan/toy-rce-api/core"
	"github.com/KhachikAstoyan/toy-rce-api/dtos"
	"github.com/KhachikAstoyan/toy-rce-api/middleware"
	"github.com/KhachikAstoyan/toy-rce-api/models"
	"github.com/KhachikAstoyan/toy-rce-api/queue"
	"github.com/KhachikAstoyan/toy-rce-api/services"
	"github.com/KhachikAstoyan/toy-rce-api/services/executor"
	"github.com/KhachikAstoyan/toy-rce-api/types"
	"github.com/labstack/echo/v4"
	amqp "github.com/rabbitmq/amqp091-go"
)

func bindSubmissionsApi(app *core.App, group *echo.Group) {
	submissionService := services.InitSubmissionService(app)
	authService := services.InitAuthService(app)
	authorize := middleware.CreateAuthMiddleware(authService)

	api := submissionsApi{app, submissionService}

	subGroup := group.Group("/submissions")

	subGroup.POST("", api.create, authorize())
	subGroup.GET("/:id", api.status, authorize())
	subGroup.DELETE("/:id", api.delete, authorize("write:submission"))

	// listen to submission results

	go func() {
		err := queue.ConsumeQueue(queue.SubmissionResultsQueue, func(delivery amqp.Delivery) error {
			payload := string(delivery.Body)
			log.Println("Got a message boss")
			log.Println(payload)

			var submissionResult types.SubmissionResult
			if err := json.Unmarshal(delivery.Body, &submissionResult); err != nil {
				return err
			}

			err := submissionService.SaveSubmissionResults(&submissionResult)

			if err != nil {
				return err
			}

			return nil
		})

		if err != nil {
			log.Fatal(err)
		}
	}()
}

type submissionsApi struct {
	app     *core.App
	service *services.SubmissionService
}

func (api *submissionsApi) status(c echo.Context) error {
	fmt.Println("YOU GOT THIS BABY")
	db := api.app.DB

	id := c.Param("id")
	var submission models.Submission

	if err := db.Select("id, created_at, updated_at, status, problem_id, user_id, solution, language, results").Where("id = ?", id).First(&submission).Error; err != nil {
		return echo.NewHTTPError(http.StatusNotFound, "submission not foudn")
	}

	fmt.Println("submissionID")
	fmt.Println(submission.ID)

	if submission.Status == "pending" || submission.Status == "" {
		return c.NoContent(http.StatusNoContent)
	}

	fmt.Println("RETURNING")
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

	if err := db.Where("language = ? AND problem_id = ?", p.Language, p.ProblemID).First(&test).Error; err != nil {
		return echo.NewHTTPError(http.StatusNotFound, "language not supported")
	}

	submission := models.Submission{
		Problem:  &problem,
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
