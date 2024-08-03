package middleware

import (
	"net/http"
	"strings"

	"github.com/KhachikAstoyan/toy-rce-api/services"
	"github.com/labstack/echo/v4"
)

type authMiddleware func(requiredPermissions ...string) echo.MiddlewareFunc

func CreateAuthMiddleware(authService *services.AuthService) authMiddleware {
	return func(requiredPermissions ...string) echo.MiddlewareFunc {
		return authorize(authService, requiredPermissions...)
	}
}

func authorize(authService *services.AuthService, requiredPermissions ...string) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			authHeader := c.Request().Header.Get("Authorization")

			if authHeader == "" {
				return echo.NewHTTPError(http.StatusUnauthorized, "Missing Authorization header")
			}

			token := strings.TrimPrefix(authHeader, "Bearer ")
			if token == authHeader {
				return echo.NewHTTPError(http.StatusUnauthorized, "Invalid token format")
			}

			claims, err := authService.ParseAccessTokenClaims(token)

			if err != nil {
				return echo.NewHTTPError(http.StatusUnauthorized, "expired or invalid token")
			}

			if !authService.HasPermissions(claims.Permissions, requiredPermissions) {
				return echo.NewHTTPError(http.StatusUnauthorized, "not enough privileges")
			}

			c.Set("userId", claims.UserId)
			c.Set("permissions", claims.Permissions)

			return next(c)
		}
	}
}
func ExtractTokenMiddleware(authService *services.AuthService) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			authHeader := c.Request().Header.Get("Authorization")
			if authHeader == "" {
				return next(c)
			}

			token := strings.TrimPrefix(authHeader, "Bearer ")
			claims, err := authService.ParseAccessTokenClaims(token)
			if err != nil {
				return next(c)
			}

			// Set claims in context
			c.Set("userId", claims.UserId)
			c.Set("permissions", claims.Permissions)
			return next(c)
		}
	}
}
