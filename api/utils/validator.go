package utils

import (
	"net/http"
	"strings"

	"github.com/go-playground/validator/v10"
	"github.com/labstack/echo/v4"
)

var validate *validator.Validate

type ValidationError struct {
	Message string            `json:"message"`
	Errors  map[string]string `json:"errors"`
}

func ValidateStruct(obj interface{}) error {
	if validate == nil {
		validate = validator.New(validator.WithRequiredStructEnabled())
	}

	err := validate.Struct(obj)

	if err != nil {
		validationErrors := err.(validator.ValidationErrors)
		errorMessages := make(map[string]string)

		for _, err := range validationErrors {
			errorMessages[strings.ToLower(err.Field())] = err.Tag()
		}

		return echo.NewHTTPError(http.StatusUnprocessableEntity, ValidationError{
			Message: "invalid request",
			Errors:  errorMessages,
		})
	}

	return nil
}
