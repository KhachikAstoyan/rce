package apis

import (
	"net/http"

	"github.com/KhachikAstoyan/toy-rce-api/core"
	"github.com/KhachikAstoyan/toy-rce-api/dtos"
	"github.com/KhachikAstoyan/toy-rce-api/middleware"
	"github.com/KhachikAstoyan/toy-rce-api/services"
	"github.com/KhachikAstoyan/toy-rce-api/utils"
	"github.com/labstack/echo/v4"
)

func bindProblemsApi(app *core.App, group *echo.Group) {
	authService := services.InitAuthService(app)
	problemService := services.InitProblemService(app)

	api := problemsApi{app: app, service: problemService}
	authorize := middleware.CreateAuthMiddleware(authService)

	subGroup := group.Group("/problems")
	subGroup.GET("", api.list)
	subGroup.GET("/:id", api.view)
	subGroup.PUT("/:id", api.update, authorize("write:problem"))
	subGroup.POST("", api.create, authorize("write:problem"))
	subGroup.DELETE("/:id", api.delete, authorize("write:problem"))
	subGroup.GET("/:id/submissions", api.listSubmissions, authorize())
	// TODO: create another controller for this
	subGroup.GET("/:id/tests/public", api.getTests, authorize("read:test"))
	subGroup.POST("/:id/tests", api.addTest, authorize("write:test"))
	subGroup.DELETE("/tests/:id", api.deleteTest, authorize("write:test"))
	subGroup.POST("/tests/:id/skeletons", api.addSkeleton, authorize("write:test"))
}

type problemsApi struct {
	app     *core.App
	service *services.ProblemService
}

func (api *problemsApi) list(c echo.Context) error {
	userID := c.Get("userId")

	page, pageSize := utils.ValidatePagination(c.QueryParam(utils.PAGE_FIELD), c.QueryParam(utils.PAGE_SIZE_FIELD))
	problems, err := api.service.GetProblems(page, pageSize, userID)

	if err != nil {
		return err
	}

	return c.JSON(http.StatusOK, problems)
}

func (api *problemsApi) view(c echo.Context) error {
	id := c.Param("id")
	problem, err := api.service.GetProblemByID(id)

	if err != nil {
		return err
	}

	return c.JSON(http.StatusOK, problem)
}

func (api *problemsApi) getTests(c echo.Context) error {
	id := c.Param("id")

	tests, err := api.service.GetPublicTests(id, &c)

	if err != nil {
		return err
	}

	return c.JSON(http.StatusOK, tests)
}

func (api *problemsApi) create(c echo.Context) error {
	p := new(dtos.CreateProblemDto)

	if err := c.Bind(p); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "couldnt parse request body")
	}

	problem, err := api.service.CreateProblem(p)

	if err != nil {
		return err
	}

	return c.JSON(http.StatusOK, problem)
}

func (api *problemsApi) update(c echo.Context) error {
	id := c.Param("id")
	p := new(dtos.CreateProblemDto)

	if id == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "no id provided")
	}

	if err := c.Bind(p); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "couldn't parse request body")
	}

	problem, err := api.service.UpdateProblem(id, p)

	if err != nil {
		return err
	}

	return c.JSON(http.StatusOK, problem)
}

func (api *problemsApi) addTest(c echo.Context) error {
	id := c.Param("id")
	t := new(dtos.CreateTestDto)

	if err := c.Bind(t); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "couldn't parse request body")
	}

	test, err := api.service.AddTestToProblem(id, t)
	if err != nil {
		return err
	}

	return c.JSON(http.StatusOK, test)
}

func (api *problemsApi) addSkeleton(c echo.Context) error {
	id := c.Param("id")

	p := new(dtos.CreateSkeletonDto)

	if err := c.Bind(p); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "couldn't parse request body")
	}

	if err := api.service.AddSkeletonToTest(id, p); err != nil {
		return err
	}

	return c.NoContent(http.StatusOK)
}

func (api *problemsApi) delete(c echo.Context) error {
	id := c.Param("id")

	if err := api.service.DeleteProblem(id); err != nil {
		return err
	}

	return c.NoContent(http.StatusOK)
}

func (api *problemsApi) deleteTest(c echo.Context) error {
	id := c.Param("id")

	if err := api.service.DeleteTestSuite(id); err != nil {
		return err
	}

	return c.NoContent(http.StatusOK)
}

func (api *problemsApi) listSubmissions(c echo.Context) error {
	problemId := c.Param("id")
	userId := c.QueryParam("userId")

	submissions, err := api.service.GetProblemSubmissions(problemId, userId, &c)

	if err != nil {
		return err
	}

	return c.JSON(http.StatusOK, submissions)
}
