package model

import "time"

// Session represents a refresh token session
type Session struct {
	ID               int       `json:"id"`
	UserID           int       `json:"user_id"`
	RefreshTokenHash string    `json:"-"`
	ExpiresAt        time.Time `json:"expires_at"`
	Revoked          bool      `json:"revoked"`
	CreatedAt        time.Time `json:"created_at"`
}
