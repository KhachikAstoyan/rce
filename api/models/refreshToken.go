package models

import "time"

type RefreshToken struct {
	ID        string `gorm:"type:uuid;default:gen_random_uuid()"`
	UserID    string `gorm:"not null"`
	Token     string `gorm:"not null"`
	CreatedAt time.Time
	UpdatedAt time.Time
	ExpiresAt time.Time
}
