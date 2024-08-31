package services

import (
	"database/sql"
	"errors"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/KhachikAstoyan/toy-rce-api/core"
	"github.com/KhachikAstoyan/toy-rce-api/models"
	"github.com/golang-jwt/jwt/v5"
	"github.com/labstack/echo/v4"
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


	// if err := s.app.DB.Create(&refreshTokenRecord).Error; err != nil {
	// 	return "", err
	// }
  err = s.app.DB.QueryRowx(`
    INSERT INTO refresh_tokens (user_id, token, expires_at)
    VALUES (:user_id, :token, :expires_at)
    RETURNING *
  `, refreshTokenRecord).StructScan(&refreshTokenRecord)

  if err != nil {
    return "", echo.NewHTTPError(http.StatusInternalServerError, err.Error())
  }

	return refrehToken, nil
}

func (s *AuthService) GenerateTokenCookie(refreshToken string) *http.Cookie {
	cookie := new(http.Cookie)
	cookie.Name = "refreshToken"
	cookie.Value = refreshToken
	cookie.Expires = getRefreshTokenExpiration()
  cookie.Domain = ".quandry.com" // TODO: get this from the config 

	cookie.Path = "/"

	cookie.HttpOnly = true
	cookie.Secure = true
	cookie.SameSite = http.SameSiteNoneMode 

	if s.app.IsDev() {
		// Optionally relax some settings for development
		cookie.Secure = false                
		cookie.SameSite = http.SameSiteLaxMode 
	}

	return cookie
}

func (s *AuthService) FindRefreshToken(token string) (*models.RefreshToken, error) {
	var storedToken models.RefreshToken
	// err := s.app.DB.Where("token = ? AND expires_at > ?", token, time.Now()).First(&storedToken).Error
  err := s.app.DB.Get(&storedToken, `
    SELECT * FROM refresh_tokens WHERE token = $1 AND expires_at > $2
  `, token, time.Now())

	if err != nil {
		return nil, echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	return &storedToken, nil
}

func (s *AuthService) UpdateRefreshToken(refreshToken *models.RefreshToken, token string) error {
	refreshToken.Token = token
	refreshToken.ExpiresAt = getRefreshTokenExpiration()
  refreshToken.UpdatedAt = time.Now()

  _, err := s.app.DB.NamedExec(`
    UPDATE refresh_tokens 
    SET token = :token, expires_at = :expires_at, updated_at = :updated_at
    WHERE id = :id
  `, refreshToken)

	// return s.app.DB.Save(refreshToken).Error
  return err
}

func (s *AuthService) DeleteRefreshToken(userId, token string) error {
  db := s.app.DB
	// err := s.app.DB.Where(&models.RefreshToken{UserID: userId, Token: token}).Delete(&models.RefreshToken{}).Error
  _, err := db.Exec(`
    DELETE FROM refresh_tokens 
    WHERE user_id = $1 AND token = $2
  `, userId, token)

	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "couldn't log out")
	}

	return nil
}

func (s *AuthService) AssignRoleToUser(userId, roleName string) error {
	db := s.app.DB
	var user models.User
	var role models.Role

	// if err := db.Where(models.User{ID: userId}).First(&user).Error; err != nil {
	// 	return err
	// }
	//
	// if err := db.Where("name = ?", roleName).First(&role).Error; err != nil {
	//
	// 	role := models.Role{
	// 		Name: roleName,
	// 	}
	//
	// 	// create the user role in case it doesn't already exist
	// 	// or there was some error or something
	// 	if err := db.Create(&role).Error; err != nil {
	// 		return err
	// 	}
	// }

	// return db.Model(&user).Association("Roles").Append(&role)

  query := `SELECT * from USERS where id = $1 LIMIT 1`
  if err := db.Get(&user, query, userId); err != nil {
    return err
  }

  query = `SELECT * FROM roles WHERE name = $1 LIMIT 1`
  err := db.Get(&role, query, roleName)

  if err != nil {
    if errors.Is(err, sql.ErrNoRows) {
      // role not found, let's create it
      query = `INSERT into roles (name) VALUES ($1) RETURNING *`
      
      if err := db.QueryRowx(query, roleName).StructScan(&role); err != nil {
        return err
      }
    } else {
      return err
    }
  }

  query = `INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)`
  _, err = db.Exec(query, userId, roleName)

  if err != nil {
    return err
  }

  log.Println("Role assigned to user")
  return nil
}

func (s *AuthService) AssignPermissionToRole(roleID, permissionID uint) error {
  db := s.app.DB

  query := `INSERT INTO role_permissions (role_id, permission_id) VALUES ($1, $2)`
  if _, err := db.Exec(query, roleID, permissionID); err != nil {
    return err
  }

  return nil

	// if err := s.app.DB.First(&role, roleID).Error; err != nil {
	// 	return err
	// }
	// if err := s.app.DB.First(&permission, permissionID).Error; err != nil {
	// 	return err
	// }
	//
	// return s.app.DB.Model(&role).Association("Permissions").Append(&permission)
}

func (s *AuthService) GetAllPermissions() ([]models.Permission, error) {
  db := s.app.DB
  var permissions []models.Permission

  query := `SELECT * FROM permissions`
  err := db.Select(&permissions, query)

  if err != nil {
    return nil, err
  }

  return permissions, nil
}

func (s *AuthService) CreatePermission(name string) (*models.Permission, error) {
  db := s.app.DB 
}

func (s *AuthService) GetAllUserPermissions(userID string) ([]string, error) {
  db := s.app.DB
	var permissionNames []string
	// err := s.app.DB.Table("permissions").
	// 	Select("DISTINCT permissions.name").
	// 	Joins("JOIN role_permissions ON role_permissions.permission_id = permissions.id").
	// 	Joins("JOIN user_roles ON user_roles.role_id = role_permissions.role_id").
	// 	Where("user_roles.user_id = ?", userID).
	// 	Pluck("name", &permissionNames).Error
  
  query := `
    SELECT DISTINCT permissions.name
    FROM permissions
    JOIN role_permissions ON role_permissions.permission_id = permissions.id
    JOIN user_roles ON user_roles.role_id = role_permissions.role_id
    WHERE user_roles.user_id = $1
  `

  err := db.Select(&permissionNames, query, userID)

	if err != nil {
		return nil, err
	}

	return permissionNames, nil
}

func (s *AuthService) HasPermissions(userPermissions, requiredPermissions []string) bool {
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
