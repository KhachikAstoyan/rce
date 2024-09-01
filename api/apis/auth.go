package apis

import (
	"errors"
	"net/http"
	"time"

	"github.com/KhachikAstoyan/toy-rce-api/core"
	"github.com/KhachikAstoyan/toy-rce-api/middleware"
	"github.com/KhachikAstoyan/toy-rce-api/providers"
	"github.com/KhachikAstoyan/toy-rce-api/services"
	"github.com/labstack/echo/v4"
	"golang.org/x/oauth2"
)

func bindAuthApi(app *core.App, group *echo.Group) {
	googleOauthConfig := providers.GetGoogleOauthConfig(app)
	authService := services.InitAuthService(app)
	userService := services.InitUserService(app)

	api := authApi{
		app,
		googleOauthConfig,
		userService,
		authService,
	}

	subGroup := group.Group("/auth")
	authorize := middleware.CreateAuthMiddleware(authService)

	bindPermissionsApi(api.app, subGroup)
	bindRolesApi(app, subGroup)

	subGroup.GET("/google", api.handleGoogleLogin)
	subGroup.GET("/google/callback", api.handleGoogleCallback)
	subGroup.POST("/refreshtoken", api.getRefreshTokenHandler, authorize())
	subGroup.POST("/refresh", api.refreshTokenhandler)
	subGroup.POST("/logout", api.logout, authorize())
}

type authApi struct {
	app               *core.App
	googleOauthConfig *oauth2.Config
	userService       *services.UserService
	authService       *services.AuthService
}

func (api *authApi) handleGoogleLogin(c echo.Context) error {
	url := api.googleOauthConfig.AuthCodeURL(providers.GoogleOauthStateString)
	return c.Redirect(http.StatusFound, url)
}

func (api *authApi) handleGoogleCallback(c echo.Context) error {
	state := c.QueryParam("state")

	if state != providers.GoogleOauthStateString {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid OAuth state")
	}

	code := c.QueryParam("code")
	token, err := api.googleOauthConfig.Exchange(c.Request().Context(), code)

	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Code exchange failed")
	}

	client := api.googleOauthConfig.Client(c.Request().Context(), token)
	userInfo, err := providers.GetGoogleUserInfo(client)

	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to get user info")
	}

	user, err := api.userService.SaveGoogleUserInfo(userInfo)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to get google user data")
	}
	accessToken, err := api.authService.GenerateAccessToken(user.ID)

	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to generate tokens")
	}

	if err := api.authService.AssignRoleToUser(user.ID, "user"); err != nil {
		println(err.Error())
		return echo.NewHTTPError(http.StatusInternalServerError, "role assignment failed")
	}

	return c.Redirect(http.StatusPermanentRedirect, api.app.Config.ClientURL+"?accessToken="+accessToken)
}

func (api *authApi) refreshTokenhandler(c echo.Context) error {
	cookie, err := c.Cookie("refreshToken")

	if err != nil {
		return echo.NewHTTPError(http.StatusUnauthorized, "no refresh token")
	}
	refreshTokenString := cookie.Value

	_, vErr := api.authService.ParseRefreshTokenClaims(refreshTokenString)
	storedToken, dbErr := api.authService.FindRefreshToken(refreshTokenString)

	if err := errors.Join(vErr, dbErr); err != nil {
		return err
	}

	accessToken, refreshToken, tokenErr := api.authService.GenerateTokenPair(storedToken.UserID)
	saveErr := api.authService.UpdateRefreshToken(storedToken, refreshToken)

	if err := errors.Join(tokenErr, saveErr); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "coldn't generate new token")
	}

	cookie = api.authService.GenerateTokenCookie(refreshToken)
	c.SetCookie(cookie)

	return c.JSON(200, map[string]string{"accessToken": accessToken})
}

func (api *authApi) getRefreshTokenHandler(c echo.Context) error {
	userId := c.Get("userId").(string)

	if userId == "" {
		return echo.NewHTTPError(http.StatusUnauthorized, "unauthorized")
	}

	refreshToken, err := api.authService.GenerateAndStoreRefreshToken(userId)

	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "coldn't generate new token")
	}

	cookie := api.authService.GenerateTokenCookie(refreshToken)
	c.SetCookie(cookie)
	return c.NoContent(http.StatusOK)
}

func (api *authApi) logout(c echo.Context) error {
	userId := c.Get("userId").(string)

	if userId == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "no user id provided")
	}

	token_cookie, err := c.Cookie("refreshToken")

	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "bad refresh token")
	}

	err = api.authService.DeleteRefreshToken(userId, token_cookie.Value)

	c.SetCookie(&http.Cookie{
		Name:    "refreshToken",
		Value:   "",
		Path:    "/",
		Expires: time.Unix(0, 0),
	})

	if err != nil {
		return err
	}

	return c.NoContent(http.StatusOK)
}
