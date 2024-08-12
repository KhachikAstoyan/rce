package models

import (
	"time"

	"github.com/KhachikAstoyan/toy-rce-api/types"
)

type Test struct {
	ID        string           `json:"id" gorm:"type:uuid;default:gen_random_uuid()"`
	CreatedAt time.Time        `json:"createdAt"`
	UpdatedAt time.Time        `json:"updatedAt"`
	Language  string           `json:"language"`
	ProblemID string           `json:"-" gorm:"not null"`
	Skeleton  string           `json:"skeleton" gorm:"not null"`
	TestSuite *types.TestSuite `json:"testSuite" gorm:"type:jsonb;not null"`
}
