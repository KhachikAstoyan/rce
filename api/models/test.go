package models

import (
	"time"
)

type Test struct {
	ID        string    `json:"id" gorm:"type:uuid;default:gen_random_uuid()"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
	Language  string    `json:"language"`
	ProblemID string    `json:"-" gorm:"not null"`
	TestCode  string    `json:"testCode" gorm:"not null"`
}
