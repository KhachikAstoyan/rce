package apis

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/KhachikAstoyan/toy-rce-api/core"
	"github.com/KhachikAstoyan/toy-rce-api/dtos"
	"github.com/KhachikAstoyan/toy-rce-api/middleware"
	"github.com/KhachikAstoyan/toy-rce-api/models"
	"github.com/KhachikAstoyan/toy-rce-api/queue"
	"github.com/KhachikAstoyan/toy-rce-api/services"
	"github.com/KhachikAstoyan/toy-rce-api/types"
	"github.com/labstack/echo/v4"
	amqp "github.com/rabbitmq/amqp091-go"
)

func bindSubmissionsApi(app *core.App, group *echo.Group) {
	submissionService := services.InitSubmissionService(app)
	problemService := services.InitProblemService(app)

	authService := services.InitAuthService(app)
	authorize := middleware.CreateAuthMiddleware(authService)

	api := submissionsApi{app, submissionService, problemService}

	subGroup := group.Group("/submissions")

	subGroup.POST("/run", api.runWithPublicTests, authorize())
	subGroup.GET("/:id/check", api.checkRunResults, authorize())
	subGroup.POST("", api.createSubmission, authorize())
	subGroup.GET("/:id/status", api.status, authorize())
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
	app            *core.App
	service        *services.SubmissionService
	problemService *services.ProblemService
}

func (api *submissionsApi) status(c echo.Context) error {
	id := c.Param("id")
	submission, err := api.service.GetSubmissionStatus(id)

	if err != nil {
		return err
	}

	if submission == nil {
		return c.NoContent(http.StatusNoContent)
	}

	return c.JSON(http.StatusOK, submission)
}

func (api *submissionsApi) createSubmission(c echo.Context) error {
	userId := c.Get("userId").(string)

	p := new(dtos.CreateSubmissionDto)

	if err := c.Bind(p); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "couldn't parse request body")
	}

	submissionId, err := api.service.CreateSubmission(p, userId, false)

	if err != nil {
		return err
	}

	return c.JSON(http.StatusOK, submissionId)
}

func (api *submissionsApi) runWithPublicTests(c echo.Context) error {
	userId := c.Get("userId").(string)

	p := new(dtos.CreateSubmissionDto)

	if err := c.Bind(p); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "couldn't parse request body")
	}

	submissionId, err := api.service.CreateSubmission(p, userId, true)

	if err != nil {
		return err
	}

	return c.JSON(http.StatusOK, submissionId)
}

func (api *submissionsApi) checkRunResults(c echo.Context) error {
	id := c.Param("id")
	submission, err := api.service.GetSubmissionStatus(id)

	if err != nil {
		return err
	}

	if submission == nil {
		return c.NoContent(http.StatusNoContent)
	}

	// ignoring this error here because we can just let the results stay in DB without
	// sending a failure message to the client
	api.service.DeleteSubmission(submission.ID)

	return c.JSON(http.StatusOK, submission)
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
