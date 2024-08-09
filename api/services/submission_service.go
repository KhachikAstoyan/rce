package services

import (
	"fmt"
	"net/http"

	"github.com/KhachikAstoyan/toy-rce-api/core"
	"github.com/KhachikAstoyan/toy-rce-api/models"
	"github.com/KhachikAstoyan/toy-rce-api/types"
	"github.com/labstack/echo/v4"
)

type SubmissionService struct {
	app *core.App
}

var submissionService *SubmissionService

func InitSubmissionService(app *core.App) *SubmissionService {
	if submissionService == nil {
		submissionService = &SubmissionService{app}
	}

	return submissionService
}

func (s *SubmissionService) SaveSubmissionResults(results *types.SubmissionResult) error {
	fmt.Println("Saving submission results")
	db := s.app.DB
	var submission models.Submission

	if err := db.Where("id = ?", results.SubmissionId).First(&submission).Error; err != nil {
		return echo.NewHTTPError(http.StatusNotFound, "submission not found")
	}

	submission.Results = results

	if results.Success {
		submission.Status = "completed"
	} else {
		submission.Status = "failed"
	}

	if err := db.Save(&submission).Error; err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "error saving submission results")
	}

	return nil
}
