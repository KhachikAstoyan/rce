package models

import (
	"time"
)

type Problem struct {
	ID          string     `json:"id" gorm:"type:uuid;default:gen_random_uuid()"`
	CreatedAt   time.Time  `json:"createdAt"`
	UpdatedAt   time.Time  `json:"updatedAt"`
	Name        string     `json:"name" gorm:"not null"`
	Slug        string     `json:"slug" gorm:"uniqueIndex"`
	Description string     `json:"description" gorm:"not null"`
	Difficulty  string     `json:"difficulty" gorm:"type:varchar(50)"`
	Tests       []Test     `json:"tests,omitempty"`
	Skeletons   []Skeleton `json:"-"`
}
