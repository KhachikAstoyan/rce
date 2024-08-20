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
	problemService := services.InitProblemService(app)

	authService := services.InitAuthService(app)
	authorize := middleware.CreateAuthMiddleware(authService)

	api := submissionsApi{app, submissionService, problemService}

	subGroup := group.Group("/submissions")

	// TODO: move this under the problem api. so that the
	// submission endpoint looks like /problem/:id/submit

	subGroup.POST("/run", api.runWithPublicTests, authorize())
	// TODO: rename this endpoint
	// I'm writing a bunch of TODO comments here because it's 2 AM
	// and I'm too lazy to refactor everything right now
	subGroup.GET("/check/:id", api.checkRunResults, authorize())
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
	app            *core.App
	service        *services.SubmissionService
	problemService *services.ProblemService
}

func (api *submissionsApi) status(c echo.Context) error {
	db := api.app.DB

	id := c.Param("id")
	var submission models.Submission

	if err := db.Select("id, created_at, updated_at, status, problem_id, user_id, solution, language, results").Where("id = ?", id).First(&submission).Error; err != nil {
		return echo.NewHTTPError(http.StatusNotFound, "submission not found")
	}

	fmt.Println(submission.ID)

	if submission.Status == "pending" || submission.Status == "" {
		return c.NoContent(http.StatusNoContent)
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
	var skeleton models.Skeleton

	if err := db.Where("id = ?", p.ProblemID).First(&problem).Error; err != nil {
		return echo.NewHTTPError(http.StatusNotFound, "problem not found")
	}

	err := db.Where("problem_id = ?", p.ProblemID).First(&test).Error

	if err != nil {
		return echo.NewHTTPError(http.StatusNotFound, "no tests found for this problem")
	}

	err = db.Where("language = ?", p.Language).Where("test_id = ?", test.ID).First(&skeleton).Error

	if err != nil {
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

	err = executor.TestSubmission(&submission, &test, &skeleton)

	if err != nil {
		return echo.NewHTTPError(http.StatusServiceUnavailable, "code execution failed")
	}

	return c.JSON(http.StatusAccepted, dtos.CreateSubmissionResponse{
		ID: submission.ID,
	})
}

func (api *submissionsApi) runWithPublicTests(c echo.Context) error {
	// TODO: refactor this into a separate service and just
	// pass something like runOnlyPublicTests into the function so
	// that the entire logic is shared between the two endpoints
	db := api.app.DB

	p := new(dtos.CreateSubmissionDto)

	if err := c.Bind(p); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "couldn't parse request body")
	}

	var problem models.Problem
	var test *models.Test
	var skeleton models.Skeleton

	if err := db.Where("id = ?", p.ProblemID).First(&problem).Error; err != nil {
		return echo.NewHTTPError(http.StatusNotFound, "problem not found")
	}

	test, err := api.problemService.GetPublicTests(p.ProblemID)

	if err != nil {
		return echo.NewHTTPError(http.StatusNotFound, "no tests found for this problem")
	}

	err = db.Where("language = ?", p.Language).Where("test_id = ?", test.ID).First(&skeleton).Error

	if err != nil {
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

	err = executor.TestSubmission(&submission, test, &skeleton)

	if err != nil {
		return echo.NewHTTPError(http.StatusServiceUnavailable, "code execution failed")
	}

	return c.JSON(http.StatusAccepted, dtos.CreateSubmissionResponse{
		ID: submission.ID,
	})
}

func (api *submissionsApi) checkRunResults(c echo.Context) error {
	db := api.app.DB

	id := c.Param("id")
	var submission models.Submission

	if err := db.Select("id, created_at, updated_at, status, problem_id, user_id, solution, language, results").Where("id = ?", id).First(&submission).Error; err != nil {
		return echo.NewHTTPError(http.StatusNotFound, "submission not found")
	}

	if submission.Status == "pending" || submission.Status == "" {
		return c.NoContent(http.StatusNoContent)
	}

	// ignoring this error here because we can just let the results stay in DB without
	// sending a failure message to the client
	db.Delete(&submission)

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
