package models

import "time"

type Skeleton struct {
	ID        string    `json:"id" gorm:"type:uuid;default:gen_random_uuid()"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
	Skeleton  string    `json:"skeleton"`
	Language  string    `json:"language"`
	ProblemID string    `json:"-" gorm:"not null"`
}
