package dtos

import (
	"github.com/KhachikAstoyan/toy-rce-api/models"
	"github.com/lib/pq"
)

type CreateProblemDto struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	Difficulty  string `json:"difficulty"`
}

type ProblemResponse struct {
	models.Problem
	Solved             bool           `json:"solved" gorm:"column:solved"`
	SupportedLanguages pq.StringArray `json:"supportedLanguages" gorm:"type:text[]"`
}

type CreateTestDto struct {
	Language string `json:"language"`
	TestCode string `json:"testCode"`
}
