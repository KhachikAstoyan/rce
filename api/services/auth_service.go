package services

import (
	"errors"
	"fmt"
	"net/http"
	"time"

	"github.com/KhachikAstoyan/toy-rce-api/core"
	"github.com/KhachikAstoyan/toy-rce-api/models"
	"github.com/golang-jwt/jwt/v5"
	"github.com/labstack/echo/v4"
	"gorm.io/gorm"
)

type AuthService struct {
	app *core.App
}

type JwtCustomClaims struct {
	jwt.RegisteredClaims
	UserId      string   `json:"userId"`
	Permissions []string `json:"permissions"`
}

const (
	PermissionAll  = "*"
	PermissionNone = "-"
)

var authService *AuthService

func InitAuthService(app *core.App) *AuthService {
	if authService == nil {
		authService = &AuthService{app}
	}

	return authService
}

func (s *AuthService) ParseAccessTokenClaims(tokenString string) (*JwtCustomClaims, error) {
	return s.parseTokenClaims(tokenString, s.app.Config.Auth.JwtAccessSecret)
}

func (s *AuthService) ParseRefreshTokenClaims(tokenString string) (*JwtCustomClaims, error) {
	return s.parseTokenClaims(tokenString, s.app.Config.Auth.JwtRefreshSecret)
}

func (s *AuthService) GenerateTokenPair(userID string) (string, string, error) {
	accessToken, err := s.GenerateAccessToken(userID)

	if err != nil {
		return "", "", err
	}

	refreshToken, err := s.GenerateAndStoreRefreshToken(userID)

	if err != nil {
		return "", "", err
	}

	return accessToken, refreshToken, nil
}

func (s *AuthService) GenerateAccessToken(userID string) (string, error) {
	permissions, err := s.GetAllUserPermissions(userID)

	if err != nil {
		return "", err
	}

	claims := &JwtCustomClaims{
		UserId:      userID,
		Permissions: permissions,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Minute * 30)),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	return token.SignedString([]byte(s.app.Config.Auth.JwtAccessSecret))
}

func (s *AuthService) GenerateAndStoreRefreshToken(userID string) (string, error) {
	claims := &JwtCustomClaims{
		UserId: userID,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(getRefreshTokenExpiration()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	refrehToken, err := token.SignedString([]byte(s.app.Config.Auth.JwtRefreshSecret))

	if err != nil {
		return "", err
	}

	refreshTokenExpiration := getRefreshTokenExpiration()
	refreshTokenRecord := models.RefreshToken{
		UserID:    userID,
		ExpiresAt: refreshTokenExpiration,
		Token:     refrehToken,
	}

	if err := s.app.DB.Create(&refreshTokenRecord).Error; err != nil {
		return "", err
	}

	return refrehToken, nil
}

func (s *AuthService) GenerateTokenCookie(refreshToken string) *http.Cookie {
	cookie := new(http.Cookie)
	cookie.Name = "refreshToken"
	cookie.Value = refreshToken
	cookie.Expires = getRefreshTokenExpiration()
	// Use the root domain to allow sharing between subdomains
	cookie.Domain = ".quandry.com" // Assuming this is your root domain

	// Set Path to root to make the cookie available across the entire site
	cookie.Path = "/"

	// Apply secure settings even in development, but allow for exceptions if needed
	cookie.HttpOnly = true
	cookie.Secure = true
	cookie.SameSite = http.SameSiteNoneMode // Changed from Strict to None

	if s.app.IsDev() {
		// Optionally relax some settings for development
		cookie.Secure = false                  // Allow non-HTTPS in development
		cookie.SameSite = http.SameSiteLaxMode // Less strict for easier testing
	}

	return cookie
}

func (s *AuthService) FindRefreshToken(token string) (*models.RefreshToken, error) {
	var storedToken models.RefreshToken
	err := s.app.DB.Where("token = ? AND expires_at > ?", token, time.Now()).First(&storedToken).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, echo.NewHTTPError(http.StatusUnauthorized, "invalid refresh token")
		}

		return nil, echo.NewHTTPError(http.StatusInternalServerError, "db error")
	}

	return &storedToken, nil
}

func (s *AuthService) UpdateRefreshToken(refreshToken *models.RefreshToken, token string) error {
	refreshToken.Token = token
	refreshToken.ExpiresAt = getRefreshTokenExpiration()

	return s.app.DB.Save(refreshToken).Error
}

func (s *AuthService) DeleteRefreshToken(userId, token string) error {
	err := s.app.DB.Where(&models.RefreshToken{UserID: userId, Token: token}).Delete(&models.RefreshToken{}).Error
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "couldn't log out")
	}

	return nil
}

func (s *AuthService) AssignRoleToUser(userId, roleName string) error {
	db := s.app.DB
	var user models.User
	var role models.Role

	if err := db.Where(models.User{ID: userId}).First(&user).Error; err != nil {
		return err
	}

	if err := db.Where("name = ?", roleName).First(&role).Error; err != nil {

		role := models.Role{
			Name: roleName,
		}

		if err := db.Create(&role).Error; err != nil {
			return err
		}
	}

	return db.Model(&user).Association("Roles").Append(&role)
}

func (s *AuthService) AssignPermissionToRole(roleID, permissionID uint) error {
	var role models.Role
	var permission models.Permission
	if err := s.app.DB.First(&role, roleID).Error; err != nil {
		return err
	}
	if err := s.app.DB.First(&permission, permissionID).Error; err != nil {
		return err
	}

	return s.app.DB.Model(&role).Association("Permissions").Append(&permission)
}

func (s *AuthService) AssignPermissionToUser(userID, permissionID string) error {
	db := s.app.DB
	var user models.User
	var role models.Permission

	if err := db.Where(models.User{ID: userID}).First(&user).Error; err != nil {
		return err
	}

	if err := db.First(&role, permissionID).Error; err != nil {
		return err
	}

	return db.Model(&user).Association("Permissions").Append(&role)
}

func (s *AuthService) GetAllUserPermissions(userID string) ([]string, error) {
	var permissionNames []string
	err := s.app.DB.Table("permissions").
		Select("DISTINCT permissions.name").
		Joins("JOIN role_permissions ON role_permissions.permission_id = permissions.id").
		Joins("JOIN user_roles ON user_roles.role_id = role_permissions.role_id").
		Where("user_roles.user_id = ?", userID).
		Pluck("name", &permissionNames).Error

	if err != nil {
		return nil, err
	}
	return permissionNames, nil
}

func (s AuthService) HasPermissions(userPermissions, requiredPermissions []string) bool {
	hasPermission := true
	if len(requiredPermissions) > 0 {
		hasPermission = false

		for _, requiredPermission := range requiredPermissions {
			if requiredPermission == PermissionNone {
				hasPermission = false
				break
			}

			for _, userPermission := range userPermissions {
				if userPermission == requiredPermission || userPermission == PermissionAll {
					hasPermission = true
					break
				}
			}
		}
	}

	return hasPermission
}

func (s *AuthService) verifyJWT(tokenString, secretKey string) (*jwt.Token, error) {
	return jwt.ParseWithClaims(tokenString, &JwtCustomClaims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}

		return []byte(secretKey), nil
	})
}

func (s *AuthService) parseTokenClaims(tokenString, secretKey string) (*JwtCustomClaims, error) {
	token, err := s.verifyJWT(tokenString, secretKey)

	if err != nil {
		return nil, errors.New("invalid or expired token")
	}

	claims, ok := token.Claims.(*JwtCustomClaims)
	if !ok || !token.Valid {
		return nil, errors.New("invalid token claims")
	}

	return claims, nil
}

func getRefreshTokenExpiration() time.Time {
	return time.Now().Add(time.Hour * 24 * 7)
}
