package services

import (
	"fmt"
	"net/http"
	"slices"

	"github.com/KhachikAstoyan/toy-rce-api/core"
	"github.com/KhachikAstoyan/toy-rce-api/db"
	"github.com/KhachikAstoyan/toy-rce-api/dtos"
	"github.com/KhachikAstoyan/toy-rce-api/models"
	"github.com/KhachikAstoyan/toy-rce-api/types"
	"github.com/KhachikAstoyan/toy-rce-api/utils"
	"github.com/gosimple/slug"
	"github.com/labstack/echo/v4"
	"gorm.io/gorm"
)

type ProblemService struct {
	app *core.App
}

var problemService *ProblemService

func InitProblemService(app *core.App) *ProblemService {
	if problemService == nil {
		problemService = &ProblemService{app}
	}

	return problemService
}

func (s *ProblemService) GetProblems(page, pageSize int, userId interface{}) ([]dtos.ProblemResponse, error) {
	db := s.app.DB

	var problems []dtos.ProblemResponse
	// result := db.Scopes(utils.Paginate(&c)).Omit("Tests").Find(&problems)
	query := `
		SELECT
			p.*,
			ARRAY_AGG(DISTINCT t.language) FILTER (WHERE t.language IS NOT NULL AND t.language != '') as supported_languages,
			EXISTS (
				SELECT 1
				FROM submissions s
				WHERE s.problem_id = p.id
				AND s.user_id = $1
				AND s.status = 'completed'
			) as solved
		FROM
			problems p
		LEFT JOIN
			tests t ON t.problem_id = p.id
		GROUP BY
			p.id
		ORDER BY created_at DESC
	`

	err := db.Raw(query, userId).Scan(&problems).Error

	if err != nil {
		return nil, echo.NewHTTPError(http.StatusInternalServerError, "couldnt find problems")
	}

	for i := range problems {
		problems[i].SupportedLanguages = []string(problems[i].SupportedLanguages)
	}

	return problems, nil
}

func (s *ProblemService) GetProblemByID(id string) (*models.Problem, error) {
	db := s.app.DB

	var problem models.Problem
	var query *gorm.DB

	if utils.IsUUID(id) {
		query = db.Where("id = ?", id)
	} else {
		query = db.Where("slug = ?", id)
	}

	if err := query.First(&problem).Error; err != nil {
		return nil, echo.NewHTTPError(http.StatusInternalServerError, "couldn't find the problem")
	}

	return &problem, nil
}

// TODO: find a use case for this man
func (s *ProblemService) GetAllTests(id string, c *echo.Context) (*models.Test, error) {
	db := s.app.DB

	var test models.Test

	err := db.Scopes(utils.Paginate(c)).Where("problem_id = ?", id).Omit("Skeleton").First(&test).Error

	if err != nil {
		return nil, echo.NewHTTPError(http.StatusNotFound, "couldnt find tests for this problem")
	}

	return &test, nil
}

func (s *ProblemService) GetPublicTests(id string, c *echo.Context) (*models.Test, error) {
	test, err := s.GetAllTests(id, c)

	if err != nil {
		return nil, err
	}

	test.TestSuite.Tests = slices.DeleteFunc(test.TestSuite.Tests, func(test types.Test) bool {
		return test.IsPublic == nil || !(*test.IsPublic)
	})

	return test, nil
}

func (s *ProblemService) CreateProblem(p *dtos.CreateProblemDto) (*models.Problem, error) {
	conn := s.app.DB
	err := utils.ValidateStruct(p)

	if err != nil {
		return nil, err
	}

	problem := models.Problem{
		Name:        p.Name,
		Slug:        slug.Make(p.Name),
		Description: p.Description,
		Difficulty:  p.Difficulty,
	}

	result := conn.Create(&problem)

	if result.Error != nil {

		fmt.Println(result.Error.Error())
		fmt.Println(result.Error)

		if utils.IsErrorCode(result.Error, db.ErrUniqueViolation) {
			return nil, echo.NewHTTPError(http.StatusUnprocessableEntity, "the name should be unique")
		}

		return nil, echo.NewHTTPError(http.StatusInternalServerError, "couldnt create problem")
	}

	return &problem, nil
}

func (s *ProblemService) UpdateProblem(id string, p *dtos.CreateProblemDto) (*models.Problem, error) {
	conn := s.app.DB

	var problem models.Problem
	if err := conn.Where("id = ?", id).First(&problem).Error; err != nil {
		return nil, echo.NewHTTPError(http.StatusNotFound, "couldnt find the problem")
	}

	if p.Name != problem.Name {
		problem.Name = p.Name
	}

	if p.Description != problem.Description {
		problem.Description = p.Description
	}

	if err := conn.Save(&problem).Error; err != nil {
		return nil, echo.NewHTTPError(http.StatusInternalServerError, "error saving the problem")
	}

	return &problem, nil

}

func (s *ProblemService) AddSkeletonToTest(id string, t *dtos.CreateSkeletonDto) error {
	db := s.app.DB

	var test models.Test
	err := db.Where("id = ?", id).First(&test).Error

	if err != nil {
		return echo.NewHTTPError(http.StatusNotFound, "test not found")
	}

	if err := utils.ValidateStruct(t); err != nil {
		return echo.NewHTTPError(http.StatusUnprocessableEntity, err.Error())
	}

	test.Skeletons = append(test.Skeletons, models.Skeleton{
		Language: t.Language,
		Skeleton: t.Skeleton,
	})

	if err := db.Save(&test).Error; err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err)
	}

	return nil
}

func (s *ProblemService) AddTestToProblem(id string, t *dtos.CreateTestDto) (*models.Test, error) {
	db := s.app.DB

	var problem models.Problem
	err := db.Where("id = ?", id).First(&problem).Error

	if err != nil {
		return nil, echo.NewHTTPError(http.StatusNotFound, "problem not found")
	}

	if err := utils.ValidateStruct(t); err != nil {
		return nil, echo.NewHTTPError(http.StatusUnprocessableEntity, err.Error())
	}

	test := models.Test{TestSuite: &t.Tests, ProblemID: id}

	if err := db.Create(&test).Error; err != nil {
		return nil, echo.NewHTTPError(http.StatusInternalServerError, err)
	}

	return &test, nil
}

func (s *ProblemService) DeleteProblem(id string) error {
	db := s.app.DB

	if err := db.Where("problem_id = ?", id).Delete(&models.Submission{}).Error; err != nil {
		return echo.NewHTTPError(http.StatusNotFound, "problem not found")
	}

	if err := db.Where("problem_id = ?", id).Delete(&models.Test{}).Error; err != nil {
		return echo.NewHTTPError(http.StatusNotFound, "problem not found")
	}

	result := db.Where("id = ?", id).Delete(&models.Problem{})

	if result.Error != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "error deleting the problem")
	}

	return nil
}

func (s *ProblemService) DeleteTestSuite(id string) error {
	db := s.app.DB

	var testSuite models.Test
	if err := db.Where("id = ?", id).First(&testSuite).Error; err != nil {
		return echo.NewHTTPError(http.StatusNotFound, "test not found")
	}

	if err := db.Delete(&testSuite).Error; err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "something went wrong")
	}

	return nil
}

func (s *ProblemService) GetProblemSubmissions(id, userId string, c *echo.Context) ([]models.Submission, error) {
	db := s.app.DB

	query := db.Scopes(utils.Paginate(c)).Where("problem_id = ?", id)
	var submissions []models.Submission
	var err error

	if userId == "" {
		err = query.Find(&submissions).Error
	} else {
		err = query.Where("user_id = ?", userId).Find(&submissions).Error
	}

	if err != nil {
		return nil, echo.NewHTTPError(http.StatusNotFound, "couldn't find submissions for this problem")
	}

	return submissions, nil
}
