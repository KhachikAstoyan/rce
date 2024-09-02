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

const getProblemsQuery string = `
	SELECT
		p.*,
		ARRAY_AGG(DISTINCT sk.language) FILTER (WHERE sk.language IS NOT NULL AND sk.language != '') as supported_languages,
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
		skeletons sk ON sk.problem_id = p.id
	GROUP BY
		p.id
	ORDER BY created_at DESC
`

func (s *ProblemService) GetProblems(page, pageSize int, userId interface{}) ([]dtos.ProblemResponse, error) {
	db := s.app.DB
	var problems []dtos.ProblemResponse

	err := db.Raw(getProblemsQuery, userId).Scan(&problems).Error

	if err != nil {
		return nil, echo.NewHTTPError(http.StatusInternalServerError, "couldnt find problems")
	}

	for i := range problems {
		problems[i].SupportedLanguages = []string(problems[i].SupportedLanguages)
	}

	return problems, nil
}

func (s *ProblemService) GetProblemDetailsByID(id string, userId interface{}) (*dtos.ProblemResponse, error) {
	db := s.app.DB

	var problem dtos.ProblemResponse

	whereClause := "problems.slug = ?"
	if utils.IsUUID(id) {
		whereClause = "problems.id = ?"
	}

	query := `
		SELECT
			problems.*,
			ARRAY_AGG(DISTINCT skeletons.language) 
        FILTER (WHERE skeletons.language IS NOT NULL AND skeletons.language != '') as supported_languages,
			EXISTS (
				SELECT 1
				FROM submissions
				WHERE submissions.problem_id = problems.id
				AND submissions.user_id = ?
				AND submissions.status = 'completed'
			) as solved
		FROM
			problems
		LEFT JOIN
			skeletons ON skeletons.problem_id = problems.id
		WHERE
			` + whereClause + `
		GROUP BY
			problems.id
	`

	if err := db.Raw(query, userId, id).Scan(&problem).Error; err != nil {
		fmt.Println(err)
		return nil, echo.NewHTTPError(http.StatusInternalServerError, "couldn't find the problem")
	}

	return &problem, nil
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

func (s *ProblemService) GetAllTests(id string) (*models.Test, error) {
	db := s.app.DB

	var test models.Test

	err := db.Where("problem_id = ?", id).First(&test).Error

	if err != nil {
		return nil, echo.NewHTTPError(http.StatusNotFound, "couldnt find tests for this problem")
	}

	return &test, nil
}

// TODO: add functions for update, delete and list if needed

func (s *ProblemService) GetSolutionTemplate(problemId, language string) (*models.SolutionTemplate, error) {
	db := s.app.DB

	template := new(models.SolutionTemplate)
	if err := db.Where(&models.SolutionTemplate{Language: language, ProblemID: problemId}).First(template).Error; err != nil {
		return nil, echo.NewHTTPError(http.StatusNotFound)
	}

	return template, nil
}

func (s *ProblemService) CreateSolutionTemplate(
	dto *dtos.CreateSolutionTemplateDTO,
) (*models.SolutionTemplate, error) {
	db := s.app.DB

	if err := utils.ValidateStruct(dto); err != nil {
		return nil, echo.NewHTTPError(http.StatusUnprocessableEntity, err)
	}

	count := int64(0)
	err := db.Model(&models.SolutionTemplate{}).
		Where("problem_id = ? AND language = ?", dto.ProblemId, dto.Language).
		Count(&count).
		Error

	if err != nil {
		return nil, echo.NewHTTPError(http.StatusInternalServerError, err)
	}

	if count > 0 {
		return nil, echo.NewHTTPError(http.StatusBadRequest, "already exists")
	}

	template := models.SolutionTemplate{
		Language:  dto.Language,
		Template:  dto.Template,
		ProblemID: dto.ProblemId,
	}

	if err := db.Create(&template).Error; err != nil {
		return nil, echo.NewHTTPError(http.StatusInternalServerError, "something went wrong")
	}

	return &template, nil
}

func (s *ProblemService) UpdateSolutionTemplate(
	problemId,
	language string,
	dto *dtos.UpdateSolutionTemplateDTO,
) (*models.SolutionTemplate, error) {
	db := s.app.DB

	// templateRecord := models.SolutionTemplate{
	//   ProblemID: problemId,
	//   Language: language,
	//   Template: dto.Template,
	// }

	var templateRecord models.SolutionTemplate

	if err := db.
		Where("problem_id = ?", problemId).
		Where("language = ?", language).
		First(&templateRecord).Error; err != nil {
		return nil, err
	}

  templateRecord.Template = dto.Template

	if err := db.Save(&templateRecord).Error; err != nil {
		return nil, err
	}

	return &templateRecord, nil
}

func (s *ProblemService) DeleteSolutionTemplate(problemId, language string) error {
	db := s.app.DB
	if err := db.
		Where("language = ? AND problem_id = ?", language, problemId).
		Delete(&models.SolutionTemplate{}).Error; err != nil {
		return err
	}

	return nil
}

func (s *ProblemService) GetPublicTests(id string) (*models.Test, error) {
	test, err := s.GetAllTests(id)

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

func (s *ProblemService) GetSkeleton(problemId, lang string) (*models.Skeleton, error) {
	db := s.app.DB
	var skeleton models.Skeleton
	err := db.Where("language = ?", lang).
		Where("problem_id = ?", problemId).
		First(&skeleton).Error

	if err != nil {
		return nil, echo.NewHTTPError(http.StatusInternalServerError, "error finding the skeleton for the language")
	}

	return &skeleton, err
}

func (s *ProblemService) UpdateSkeleton(problemId, lang string, dto *dtos.UpdateSkeletonDto) (*models.Skeleton, error) {
	db := s.app.DB
	err := utils.ValidateStruct(dto)

	if err != nil {
		return nil, err
	}

	// skeletonRecord := models.Skeleton{
	// 	ProblemID: problemId,
	// 	Language:  lang,
	// 	Skeleton:  dto.Skeleton,
	// }
	var skeletonRecord models.Skeleton

	if err := db.
		Where("problem_id = ?", problemId).
		Where("language = ?", lang).
		First(&skeletonRecord).Error; err != nil {
		return nil, err
	}

	skeletonRecord.Skeleton = dto.Skeleton

	err = db.Save(&skeletonRecord).Error
	if err != nil {
		return nil, err
	}

	return &skeletonRecord, nil
}

func (s *ProblemService) AddSkeletonToProblem(id string, t *dtos.CreateSkeletonDto) error {
	db := s.app.DB

	var test models.Problem
	err := db.Where("id = ?", id).First(&test).Error

	if err != nil {
		return echo.NewHTTPError(http.StatusNotFound, "problem not found")
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

func (s *ProblemService) DeleteSkeleton(problemId string, language string) error {
	db := s.app.DB

	err := db.Where("problem_id = ? AND language = ?", problemId, language).Delete(&models.Skeleton{}).Error

	if err != nil {
		return echo.NewHTTPError(http.StatusNotFound, "couldn't delete the skeleton")
	}

	return nil
}

func (s *ProblemService) GetProblemSkeletons(problemId string) (map[string]string, error) {
	db := s.app.DB

	var skeletons []models.Skeleton

	err := db.Where("problem_id = ?", problemId).Find(&skeletons).Error

	if err != nil {
		return nil, echo.NewHTTPError(http.StatusNotFound, "couldn't find skeletons")
	}

	skeletonResults := make(map[string]string)

	for _, skeleton := range skeletons {
		skeletonResults[skeleton.Language] = skeleton.Skeleton
	}

	return skeletonResults, nil
}

func (s *ProblemService) GetProblemSolutionTemplates(problemId string) (map[string]string, error) {
	db := s.app.DB

	var templates []models.SolutionTemplate
	err := db.Where("problem_id = ?", problemId).Find(&templates).Error

	if err != nil {
		return nil, echo.NewHTTPError(http.StatusNotFound, "couldn't find templates")
	}

	templateResults := make(map[string]string)

	for _, template := range templates {
		templateResults[template.Language] = template.Template
	}

	return templateResults, nil
}

func (s *ProblemService) AddTestToProblem(id string, t *dtos.CreateTestDto) (*models.Test, error) {
	db := s.app.DB

	var problem models.Problem

	if err := utils.ValidateStruct(t); err != nil {
		return nil, echo.NewHTTPError(http.StatusUnprocessableEntity, err.Error())
	}

	err := db.Where("id = ?", id).First(&problem).Error
	if err != nil {
		return nil, echo.NewHTTPError(http.StatusNotFound, "problem not found")
	}

	test := models.Test{TestSuite: &t.Tests, ProblemID: id}

	if err := db.Create(&test).Error; err != nil {
		return nil, echo.NewHTTPError(http.StatusInternalServerError, err)
	}

	return &test, nil
}

func (s *ProblemService) UpdateTest(problemId string, dto *dtos.CreateTestDto) (*models.Test, error) {
	db := s.app.DB

	if err := utils.ValidateStruct(dto); err != nil {
		return nil, err
	}

	var test models.Test
	err := db.Model(&models.Test{}).
		Where("problem_id = ?", problemId).
		Update("test_suite", dto.Tests).
		Error

	if err != nil {
		return nil, err
	}

	return &test, nil
}

func (s *ProblemService) DeleteProblem(id string) error {
	db := s.app.DB

	tx := db.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
			// You might want to handle the panic or log it
		} else if tx.Error != nil {
			tx.Rollback() // Rollback on error
		} else {
			tx.Commit() // Commit if no errors
		}
	}()

	if err := tx.Where("problem_id = ?", id).Delete(&models.Submission{}).Error; err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "couldn't delete the submissions for problem")
	}

	if err := tx.Where("problem_id = ?", id).Delete(&models.Test{}).Error; err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "couldn't delete the tests for this problem")
	}

	if err := tx.Where("problem_id = ?", id).Delete(&models.SolutionTemplate{}).Error; err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "couldn't delete the solution templates for this problem'")
	}

	if err := tx.Where("problem_id = ?", id).Delete(&models.Skeleton{}).Error; err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "couldn't delete skeletons for problem")
	}

	result := tx.Where("id = ?", id).Delete(&models.Problem{})

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
