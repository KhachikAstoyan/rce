package dtos

import "github.com/KhachikAstoyan/toy-rce-api/models"

type UserResponse struct {
	models.User
	Roles       []string `json:"roles"`
	Permissions []string `json:"permissions"`
}
