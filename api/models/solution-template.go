package models

import "time"

type SolutionTemplate struct {
	ID        string    `json:"id" gorm:"type:uuid;default:gen_random_uuid()"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
	ProblemID string    `json:"problemId"`
	Template  string    `json:"template" gorm:"not null"`
	Language  string    `json:"language" gorm:"not null"`
}
