package models

import (
	"time"

	"github.com/KhachikAstoyan/toy-rce-api/types"
)

type Test struct {
	ID        string           `json:"id" gorm:"type:uuid;default:gen_random_uuid()"`
	CreatedAt time.Time        `json:"createdAt"`
	UpdatedAt time.Time        `json:"updatedAt"`
	ProblemID string           `json:"-" gorm:"not null"`
	TestSuite *types.TestSuite `json:"testSuite" gorm:"type:jsonb;not null"`
	Skeletons []Skeleton       `json:"-"`
}
