package models

import (
	"time"

	"github.com/KhachikAstoyan/toy-rce-api/types"
)

type Submission struct {
	ID        string                  `json:"id" gorm:"type:uuid;default:gen_random_uuid()"`
	CreatedAt time.Time               `json:"createdAt"`
	UpdatedAt time.Time               `json:"updatedAt"`
	Status    string                  `json:"status"`
	Problem   Problem                 `json:"problem"`
	ProblemID string                  `json:"problemId" gorm:"not null"`
	User      User                    `json:"user"`
	UserID    string                  `json:"userId" gorm:"not null"`
	Solution  string                  `json:"solution" gorm:"type:text;not null"`
	Language  string                  `json:"language" gorm:"not null"`
	Results   *types.SubmissionResult `json:"results" gorm:"type:jsonb"`
}
