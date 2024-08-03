package models

import "time"

type Profile struct {
	ID           string    `json:"id" gorm:"type:uuid;default:gen_random_uuid()"`
	UserID       string    `json:"userId" gorm:"not null"`
	User         User      `json:"-"`
	CreatedAt    time.Time `json:"createdAt"`
	UpdatedAt    time.Time `json:"updatedAt"`
	Provider     string    `json:"provider" gorm:"index;not null"`
	ProviderID   string    `json:"providerId" gorm:"not null"`
	PasswordHash string
}
