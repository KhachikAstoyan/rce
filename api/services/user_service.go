package services

import (
	"errors"
	"net/http"

	"github.com/KhachikAstoyan/toy-rce-api/core"
	"github.com/KhachikAstoyan/toy-rce-api/dtos"
	"github.com/KhachikAstoyan/toy-rce-api/models"
	"github.com/KhachikAstoyan/toy-rce-api/providers"
	"github.com/labstack/echo/v4"

	"gorm.io/gorm"
)

type UserService struct {
	app         *core.App
	authService *AuthService
}

var userService *UserService

func InitUserService(app *core.App) *UserService {
	authService := InitAuthService(app)

	if userService == nil {
		userService = &UserService{app, authService}
	}

	return userService
}

func (s *UserService) GetUserWithPermissions(id string) (*dtos.UserResponse, error) {
	var user models.User

	err := s.app.DB.
		Preload("Roles", func(db *gorm.DB) *gorm.DB {
			return db.Select("id,name")
		}).
		Where("id = ?", id).First(&user).Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, echo.ErrNotFound
		}
		return nil, echo.NewHTTPError(http.StatusInternalServerError, "Database error")
	}

	permissions, err := s.authService.GetAllUserPermissions(id)

	if err != nil {
		return nil, echo.NewHTTPError(http.StatusInternalServerError, "Database error")
	}

	roleNames := make([]string, len(user.Roles))
	for i, role := range user.Roles {
		roleNames[i] = role.Name
	}

	response := dtos.UserResponse{
		User:        user,
		Roles:       roleNames,
		Permissions: permissions,
	}

	return &response, nil
}

func (s *UserService) SaveGoogleUserInfo(userInfo *providers.GoogleProfile) (*models.User, error) {
	db := s.app.DB
	var profile models.Profile
	var user models.User
	tx := db.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	result := tx.Where(models.Profile{Provider: "google", ProviderID: userInfo.ID}).First(&profile)

	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			user = models.User{
				Email: userInfo.Email,
				Name:  userInfo.Name,
			}

			if err := tx.Create(&user).Error; err != nil {
				tx.Rollback()
				return nil, errors.New("failed to create user")
			}

			profile := models.Profile{
				UserID:     user.ID,
				Provider:   "google",
				ProviderID: userInfo.ID,
			}

			if err := tx.Create(&profile).Error; err != nil {
				tx.Rollback()
				return nil, errors.New("failed to create profile")
			}
		} else {
			tx.Rollback()
			return nil, errors.New("database error")
		}
	} else {
		if err := tx.Where(models.User{ID: profile.UserID}).First(&user).Error; err != nil {
			tx.Rollback()
			return nil, errors.New("failed to find user")
		}

		user.Email = userInfo.Email
		user.Name = userInfo.Name
		user.Picture = userInfo.Picture

		if err := tx.Save(&user).Error; err != nil {
			tx.Rollback()
			return nil, errors.New("failed to update user")
		}
	}

	if err := tx.Commit().Error; err != nil {
		return nil, errors.New("failed to commit transaction")
	}

	return &user, nil

}
