package model

import "time"

// User represents a user in the system
type User struct {
	ID           int       `json:"id"`
	Email        string    `json:"email"`
	PasswordHash string    `json:"-"`
	Roles        string    `json:"roles"`
	CreatedAt    time.Time `json:"created_at"`
}
