package apis

import (
	"net/http"

	"github.com/KhachikAstoyan/toy-rce-api/core"
	"github.com/KhachikAstoyan/toy-rce-api/dtos"
	"github.com/KhachikAstoyan/toy-rce-api/middleware"
	"github.com/KhachikAstoyan/toy-rce-api/models"
	"github.com/KhachikAstoyan/toy-rce-api/services"
	"github.com/KhachikAstoyan/toy-rce-api/utils"
	"github.com/gosimple/slug"
	"github.com/labstack/echo/v4"
	"gorm.io/gorm"
)

func bindProblemsApi(app *core.App, group *echo.Group) {
	authService := services.InitAuthService(app)
	api := problemsApi{app: app}
	authorize := middleware.CreateAuthMiddleware(authService)

	subGroup := group.Group("/problems")
	subGroup.GET("", api.list)
	subGroup.GET("/:id", api.view)
	subGroup.PUT("/:id", api.update, authorize("write:problem"))
	subGroup.POST("", api.create, authorize("write:problem"))
	subGroup.DELETE("/:id", api.delete, authorize("write:problem"))
	subGroup.GET("/:id/submissions", api.listSubmissions, authorize())
	subGroup.GET("/:id/tests", api.getTests, authorize("read:test"))
	subGroup.POST("/:id/tests", api.addTest, authorize("write:test"))
}

type problemsApi struct {
	app *core.App
}

func (api *problemsApi) list(c echo.Context) error {
	db := api.app.DB
	userID := c.Get("userId")
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

	err := db.Raw(query, userID).Scan(&problems).Error

	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "couldnt find problems")
	}

	for i := range problems {
		problems[i].SupportedLanguages = []string(problems[i].SupportedLanguages)
	}

	return c.JSON(http.StatusOK, problems)
}

func (api *problemsApi) view(c echo.Context) error {
	db := api.app.DB

	id := c.Param("id")
	var problem models.Problem
	var query *gorm.DB

	if utils.IsUUID(id) {
		query = db.Where("id = ?", id)
	} else {
		query = db.Where("slug = ?", id)
	}

	if err := query.First(&problem).Error; err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "couldn't find the problem")
	}

	return c.JSON(http.StatusOK, problem)
}

func (api *problemsApi) getTests(c echo.Context) error {
	db := api.app.DB

	id := c.Param("id")
	lang := c.QueryParam("lang")

	query := db.Scopes(utils.Paginate(&c)).Where("problem_id = ?", id)
	var tests []models.Test
	var err error

	if lang == "" {
		err = query.Find(&tests).Error
	} else {
		err = query.Where("language = ?", lang).Find(&tests).Error
	}

	if err != nil {
		return echo.NewHTTPError(http.StatusNotFound, "couldnt find tests for this problem")
	}

	return c.JSON(http.StatusOK, tests)
}

func (api *problemsApi) create(c echo.Context) error {
	db := api.app.DB
	p := new(dtos.CreateProblemDto)

	if err := c.Bind(p); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "couldnt parse request body")
	}

	problem := models.Problem{
		Name:        p.Name,
		Slug:        slug.Make(p.Name),
		Description: p.Description,
		Difficulty:  p.Difficulty,
	}

	result := db.Create(&problem)

	if result.Error != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "couldnt create problem")
	}

	return c.JSON(http.StatusOK, problem)
}

func (api *problemsApi) update(c echo.Context) error {
	db := api.app.DB
	id := c.Param("id")
	p := new(dtos.CreateProblemDto)

	if id == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "no id provided")
	}

	if err := c.Bind(p); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "couldn't parse request body")
	}

	var problem models.Problem
	if err := db.Where("id = ?", id).First(&problem).Error; err != nil {
		return echo.NewHTTPError(http.StatusNotFound, "couldnt find the problem")
	}

	if p.Name != problem.Name {
		problem.Name = p.Name
	}

	if p.Description != problem.Description {
		problem.Description = p.Description
	}

	if err := db.Save(&problem).Error; err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "error saving the problem")
	}

	return c.JSON(http.StatusOK, problem)
}

func (api *problemsApi) addTest(c echo.Context) error {
	db := api.app.DB

	id := c.Param("id")
	t := new(dtos.CreateTestDto)

	if err := c.Bind(t); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "couldn't parse request body")
	}

	var problem models.Problem
	err := db.Where("id = ?", id).First(&problem).Error

	if err != nil {
		return echo.NewHTTPError(http.StatusNotFound, "problem not found")
	}

	problem.Tests = append(problem.Tests, models.Test{
		Language: t.Language,
		TestCode: t.TestCode,
	})

	if err := db.Save(&problem).Error; err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err)
	}

	return c.NoContent(http.StatusOK)
}

func (api *problemsApi) delete(c echo.Context) error {
	db := api.app.DB

	id := c.Param("id")

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

	return c.NoContent(http.StatusOK)
}

func (api *problemsApi) listSubmissions(c echo.Context) error {
	db := api.app.DB
	problemId := c.Param("id")
	userId := c.QueryParam("userId")
	query := db.Scopes(utils.Paginate(&c)).Where("problem_id = ?", problemId)
	var submissions []models.Submission
	var err error

	if userId == "" {
		err = query.Find(&submissions).Error
	} else {
		err = query.Where("user_id = ?", userId).Find(&submissions).Error
	}

	if err != nil {
		return echo.NewHTTPError(http.StatusNotFound, "couldn't find submissions for this problem")
	}

	return c.JSON(http.StatusOK, submissions)
}
