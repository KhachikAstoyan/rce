package dtos

import (
	"github.com/KhachikAstoyan/toy-rce-api/models"
	"github.com/KhachikAstoyan/toy-rce-api/types"
	"github.com/lib/pq"
)

type CreateProblemDto struct {
	Name        string `json:"name" validate:"required"`
	Description string `json:"description" validate:"required"`
	Difficulty  string `json:"difficulty" validate:"required"`
}

type ProblemResponse struct {
	models.Problem
	Solved             bool           `json:"solved" gorm:"column:solved"`
	SupportedLanguages pq.StringArray `json:"supportedLanguages" gorm:"type:text[]"`
}

type CreateTestDto struct {
	Tests types.TestSuite `json:"tests" validate:"required"`
}

type CreateSkeletonDto struct {
	Skeleton string `json:"skeleton" validate:"required"`
	Language string `json:"language" validate:"required"`
}

type UpdateSkeletonDto struct {
  Skeleton string `json:"skeleton" validate:"required"`
}
