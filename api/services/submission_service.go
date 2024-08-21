package services

import (
	"fmt"
	"net/http"

	"github.com/KhachikAstoyan/toy-rce-api/core"
	"github.com/KhachikAstoyan/toy-rce-api/dtos"
	"github.com/KhachikAstoyan/toy-rce-api/models"
	"github.com/KhachikAstoyan/toy-rce-api/services/executor"
	"github.com/KhachikAstoyan/toy-rce-api/types"
	"github.com/labstack/echo/v4"
)

type SubmissionService struct {
	app            *core.App
	problemService *ProblemService
}

var submissionService *SubmissionService

func InitSubmissionService(app *core.App) *SubmissionService {
	if submissionService == nil {
		problemService := InitProblemService(app)
		submissionService = &SubmissionService{app, problemService}
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

func (s *SubmissionService) CreateSubmission(p *dtos.CreateSubmissionDto, userId string, dryRun bool) (*dtos.CreateSubmissionResponse, error) {
	db := s.app.DB
	problem, err := s.problemService.GetProblemByID(p.ProblemID)

	if err != nil {
		return nil, err
	}

	var test *models.Test

	if dryRun {
		test, err = s.problemService.GetPublicTests(p.ProblemID)
	} else {
		test, err = s.problemService.GetAllTests(p.ProblemID)
	}

	if err != nil {
		return nil, err
	}

	skeleton, err := s.problemService.GetSkeleton(test.ID, p.Language)

	if err != nil {
		return nil, err
	}

	submission := models.Submission{
		Problem:  problem,
		Solution: p.Solution,
		Language: p.Language,
		UserID:   userId,
		Status:   "pending",
	}

	if err := db.Create(&submission).Error; err != nil {
		return nil, echo.NewHTTPError(http.StatusInternalServerError, "couldn't create submission")
	}

	err = executor.TestSubmission(&submission, test, skeleton)

	if err != nil {
		return nil, echo.NewHTTPError(http.StatusServiceUnavailable, "code execution failed")
	}

	return &dtos.CreateSubmissionResponse{
		ID: submission.ID,
	}, nil
}

func (s *SubmissionService) GetSubmissionStatus(id string) (*models.Submission, error) {
	db := s.app.DB
	var submission models.Submission

	if err := db.Select("id, created_at, updated_at, status, problem_id, user_id, solution, language, results").Where("id = ?", id).First(&submission).Error; err != nil {
		return nil, echo.NewHTTPError(http.StatusNotFound, "submission not found")
	}

	if submission.Status == "pending" || submission.Status == "" {
		return nil, nil
	}

	return &submission, nil
}

func (s *SubmissionService) DeleteSubmission(id string) error {
	err := s.app.DB.Delete(&models.Submission{ID: id}).Error

	if err != nil {
		return err
	}

	return err
}
