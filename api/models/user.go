package models

import "time"

type User struct {
	ID            string         `json:"id" gorm:"type:uuid;default:gen_random_uuid()"`
	CreatedAt     time.Time      `json:"createdAt"`
	UpdatedAt     time.Time      `json:"updatedAt"`
	Email         string         `json:"email" gorm:"unique;not null"`
	Name          string         `json:"name"`
	Picture       string         `json:"picture"`
	Submissions   []Submission   `json:"-"`
	Profiles      []Profile      `json:"profiles"`
	RefreshTokens []RefreshToken `json:"-"`
	Roles         []Role         `json:"roles" gorm:"many2many:user_roles;"`
}
