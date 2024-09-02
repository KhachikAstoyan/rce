package apis

import (
	"fmt"
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

  subGroup.GET("/:id/tests", api.getAllTests, authorize("read:allTests"))
	subGroup.GET("/:id/tests/public", api.getTests, authorize("read:test"))
	subGroup.POST("/:id/tests", api.addTest, authorize("write:test"))
  subGroup.PUT("/:id/tests", api.updateTest, authorize("write:test"))
  subGroup.DELETE("/tests/:id", api.deleteTest, authorize("write:test"))

	subGroup.GET("/:id/skeletons", api.getSkeletons, authorize("write:test"))
	subGroup.POST("/:id/skeletons", api.addSkeleton, authorize("write:test"))
  subGroup.PUT("/:id/skeletons/:lang", api.updateSkeleton, authorize("write:test"))
	subGroup.DELETE("/:id/skeletons/:lang", api.deleteSeleton, authorize("write:test"))


	subGroup.GET("/:id/templates", api.getAllSolutionTemplates)
	subGroup.GET("/:id/templates/:lang", api.getSolutionTemplate)
  subGroup.POST("/:id/templates", api.createSolutionTemplate, authorize("write:template"))
  subGroup.PUT("/:id/templates/:lang", api.updateSolutionTemplate, authorize("write:template"))
	subGroup.DELETE("/:id/templates/:lang", api.deleteSolutionTemplate)
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
	problem, err := api.service.GetProblemDetailsByID(id, c.Get("userId"))

	if err != nil {
		return err
	}

	return c.JSON(http.StatusOK, problem)
}

func (api *problemsApi) getTests(c echo.Context) error {
	id := c.Param("id")

	tests, err := api.service.GetPublicTests(id)

	if err != nil {
		return err
	}

	return c.JSON(http.StatusOK, tests)
}

func (api *problemsApi) getAllTests(c echo.Context) error {
  id := c.Param("id")
  tests, err := api.service.GetAllTests(id)

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

func (api *problemsApi) updateTest(c echo.Context) error {
  id := c.Param("id")
  dto := new(dtos.CreateTestDto)

  if err := c.Bind(dto); err != nil {
    return echo.NewHTTPError(http.StatusBadRequest, err.Error())
  }

  test, err := api.service.UpdateTest(id, dto)
  if err != nil {
    return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
  }

  return c.JSON(http.StatusOK, test)
}

func (api *problemsApi) addSkeleton(c echo.Context) error {
	id := c.Param("id")

	p := new(dtos.CreateSkeletonDto)

	if err := c.Bind(p); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "couldn't parse request body")
	}

	if err := api.service.AddSkeletonToProblem(id, p); err != nil {
		return err
	}

	return c.NoContent(http.StatusOK)
}

func (api *problemsApi) getSkeletons(c echo.Context) error {
	id := c.Param("id")

	skeletons, err := api.service.GetProblemSkeletons(id)

	if err != nil {
		return err
	}

	return c.JSON(http.StatusOK, skeletons)
}

func (api *problemsApi) deleteSeleton(c echo.Context) error {
	problemId := c.Param("id")
	language := c.Param("lang")

	fmt.Println(problemId)
	fmt.Println(language)

	if err := api.service.DeleteSkeleton(problemId, language); err != nil {
		return err
	}

	return c.NoContent(http.StatusOK)
}

func (api *problemsApi) updateSkeleton(c echo.Context) error {
	problemId := c.Param("id")
	language := c.Param("lang")
  dto := new(dtos.UpdateSkeletonDto)

  if err := c.Bind(&dto); err != nil {
    return echo.NewHTTPError(http.StatusBadRequest, err.Error())
  }

  skeleton, err := api.service.UpdateSkeleton(problemId, language, dto)
  
  if err != nil {
    return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
  }

  return c.JSON(http.StatusOK, skeleton)
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

func (api *problemsApi) getAllSolutionTemplates(c echo.Context) error {
	id := c.Param("id")

	templates, err := api.service.GetProblemSolutionTemplates(id)

	if err != nil {
		return err
	}

	return c.JSON(http.StatusOK, templates)
}

func (api *problemsApi) getSolutionTemplate(c echo.Context) error {
	id := c.Param("id")
	lang := c.Param("lang")

	template, err := api.service.GetSolutionTemplate(id, lang)

	if err != nil {
		return err
	}

	return c.JSON(http.StatusOK, template)
}

func (api *problemsApi) createSolutionTemplate(c echo.Context) error {
	dto := new(dtos.CreateSolutionTemplateDTO)
	id := c.Param("id")

	if err := c.Bind(dto); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Couldn't process the request body")
	}

	dto.ProblemId = id

	template, err := api.service.CreateSolutionTemplate(dto)

	if err != nil {
		return err
	}

	return c.JSON(http.StatusOK, template)
}

func (api *problemsApi) updateSolutionTemplate(c echo.Context) error {
  id := c.Param("id")
  lang := c.Param("lang")
  dto := new(dtos.UpdateSolutionTemplateDTO)

  if err := c.Bind(dto); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Couldn't process the request body")
  }

  template, err := api.service.UpdateSolutionTemplate(id, lang, dto)

  if err != nil {
    return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
  }

  return c.JSON(http.StatusOK, template)
}

func (api *problemsApi) deleteSolutionTemplate(c echo.Context) error {
	id := c.Param("id")
	lang := c.Param("lang")

	if err := api.service.DeleteSolutionTemplate(id, lang); err != nil {
		return err
	}

	return c.NoContent(http.StatusOK)
}
