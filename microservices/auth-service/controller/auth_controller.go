package controller

import (
	"crypto/rand"
	"database/sql"
	"encoding/base64"
	"errors"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"go-microservices/auth-service/model"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v4"
	"golang.org/x/crypto/bcrypt"
)

// AuthController handles auth operations
type AuthController struct {
	DB *sql.DB
}

// NewAuthController creates a new auth controller
func NewAuthController(db *sql.DB) *AuthController {
	return &AuthController{DB: db}
}

// Register request
type RegisterRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=8"`
}

// Login request
type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

// Token response
type TokenResponse struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
}

// Register handles user registration
func (ac *AuthController) Register(c *gin.Context) {
	var req RegisterRequest
	if err := c.BindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to hash password"})
		return
	}

	var id int
	err = ac.DB.QueryRow("INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id", req.Email, string(hash)).Scan(&id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"id": id, "email": req.Email})
}

// Login handles user login
func (ac *AuthController) Login(c *gin.Context) {
	var req LoginRequest
	if err := c.BindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var user model.User
	err := ac.DB.QueryRow("SELECT id, email, password_hash, roles FROM users WHERE email = $1", req.Email).
		Scan(&user.ID, &user.Email, &user.PasswordHash, &user.Roles)
	if err == sql.ErrNoRows {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid credentials"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid credentials"})
		return
	}

	accessToken, err := createAccessToken(user.ID, user.Roles)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create access token"})
		return
	}

	refreshToken, refreshHash, err := createRefreshTokenAndHash()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create refresh token"})
		return
	}

	expiresAt := time.Now().Add(7 * 24 * time.Hour)
	_, err = ac.DB.Exec("INSERT INTO sessions (user_id, refresh_token_hash, expires_at) VALUES ($1, $2, $3)", user.ID, refreshHash, expiresAt)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, TokenResponse{AccessToken: accessToken, RefreshToken: refreshToken})
}

// Refresh request
type RefreshRequest struct {
	RefreshToken string `json:"refresh_token" binding:"required"`
}

// Refresh handles token refresh and rotation
func (ac *AuthController) Refresh(c *gin.Context) {
	var req RefreshRequest
	if err := c.BindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	session, err := ac.findSessionByRefreshToken(req.RefreshToken)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid refresh token"})
		return
	}
	if session.Revoked {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "session revoked"})
		return
	}
	if time.Now().After(session.ExpiresAt) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "refresh token expired"})
		return
	}

	// Load user roles
	var roles string
	err = ac.DB.QueryRow("SELECT roles FROM users WHERE id = $1", session.UserID).Scan(&roles)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load user"})
		return
	}

	// Rotate refresh token
	newRefresh, newHash, err := createRefreshTokenAndHash()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create refresh token"})
		return
	}
	expiresAt := time.Now().Add(7 * 24 * time.Hour)
	_, err = ac.DB.Exec("UPDATE sessions SET refresh_token_hash = $1, expires_at = $2 WHERE id = $3", newHash, expiresAt, session.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	accessToken, err := createAccessToken(session.UserID, roles)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create access token"})
		return
	}

	c.JSON(http.StatusOK, TokenResponse{AccessToken: accessToken, RefreshToken: newRefresh})
}

// Logout request
type LogoutRequest struct {
	RefreshToken string `json:"refresh_token" binding:"required"`
}

// Logout invalidates a session
func (ac *AuthController) Logout(c *gin.Context) {
	var req LogoutRequest
	if err := c.BindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	session, err := ac.findSessionByRefreshToken(req.RefreshToken)
	if err != nil {
		// If not found, return success for idempotency
		c.JSON(http.StatusOK, gin.H{"message": "logged out"})
		return
	}

	_, err = ac.DB.Exec("UPDATE sessions SET revoked = TRUE WHERE id = $1", session.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "logged out"})
}

// Revoke request
type RevokeRequest struct {
	RefreshToken string `json:"refresh_token,omitempty"`
	SessionID    *int   `json:"session_id,omitempty"`
}

// Revoke allows users to revoke their refresh token or admins to revoke any session by id
func (ac *AuthController) Revoke(c *gin.Context) {
	var req RevokeRequest
	if err := c.BindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// If session_id provided -> admin-only operation
	if req.SessionID != nil {
		roles := c.GetHeader("X-User-Roles")
		if roles == "" || !strings.Contains(roles, "admin") {
			c.JSON(http.StatusForbidden, gin.H{"error": "admin role required to revoke by session_id"})
			return
		}

		_, err := ac.DB.Exec("UPDATE sessions SET revoked = TRUE WHERE id = $1", *req.SessionID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "session revoked"})
		return
	}

	// Otherwise, require refresh token to revoke own session
	if req.RefreshToken == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "refresh_token or session_id required"})
		return
	}

	session, err := ac.findSessionByRefreshToken(req.RefreshToken)
	if err != nil {
		// idempotent: return success even if token not found
		c.JSON(http.StatusOK, gin.H{"message": "revoked"})
		return
	}

	_, err = ac.DB.Exec("UPDATE sessions SET revoked = TRUE WHERE id = $1", session.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "revoked"})
}

// List sessions response type
type SessionInfo struct {
	ID        int       `json:"id"`
	UserID    int       `json:"user_id"`
	Email     string    `json:"email"`
	ExpiresAt time.Time `json:"expires_at"`
	Revoked   bool      `json:"revoked"`
	CreatedAt time.Time `json:"created_at"`
}

// ListSessions returns all sessions (admin-only) with optional ?user_id= filter
func (ac *AuthController) ListSessions(c *gin.Context) {
	roles := c.GetHeader("X-User-Roles")
	if roles == "" || !strings.Contains(roles, "admin") {
		c.JSON(http.StatusForbidden, gin.H{"error": "admin role required"})
		return
	}

	userIDStr := c.Query("user_id")
	var rows *sql.Rows
	var err error
	if userIDStr != "" {
		uid, parseErr := strconv.Atoi(userIDStr)
		if parseErr != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user_id"})
			return
		}
		rows, err = ac.DB.Query(`SELECT s.id, s.user_id, u.email, s.expires_at, s.revoked, s.created_at
		FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.user_id = $1`, uid)
	} else {
		rows, err = ac.DB.Query(`SELECT s.id, s.user_id, u.email, s.expires_at, s.revoked, s.created_at
		FROM sessions s JOIN users u ON u.id = s.user_id ORDER BY s.created_at DESC`)
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	var out []SessionInfo
	for rows.Next() {
		var si SessionInfo
		if err := rows.Scan(&si.ID, &si.UserID, &si.Email, &si.ExpiresAt, &si.Revoked, &si.CreatedAt); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		out = append(out, si)
	}

	c.JSON(http.StatusOK, out)
}

// Helper: create JWT access token
func createAccessToken(userID int, roles string) (string, error) {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		return "", errors.New("missing JWT_SECRET env")
	}

	exp := time.Now().Add(15 * time.Minute)
	claims := jwt.MapClaims{
		"user_id": userID,
		"roles":   roles,
		"exp":     exp.Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signed, err := token.SignedString([]byte(secret))
	if err != nil {
		return "", err
	}
	return signed, nil
}

// Helper: find session by refresh token (using bcrypt compare)
func (ac *AuthController) findSessionByRefreshToken(token string) (*model.Session, error) {
	rows, err := ac.DB.Query("SELECT id, user_id, refresh_token_hash, expires_at, revoked FROM sessions WHERE revoked = FALSE")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var s model.Session
		if err := rows.Scan(&s.ID, &s.UserID, &s.RefreshTokenHash, &s.ExpiresAt, &s.Revoked); err != nil {
			return nil, err
		}
		if bcrypt.CompareHashAndPassword([]byte(s.RefreshTokenHash), []byte(token)) == nil {
			return &s, nil
		}
	}
	return nil, errors.New("session not found")
}

// Helper: create a refresh token and its bcrypt hash
func createRefreshTokenAndHash() (string, string, error) {
	raw := make([]byte, 32)
	if _, err := rand.Read(raw); err != nil {
		return "", "", err
	}
	token := base64.RawURLEncoding.EncodeToString(raw)
	hash, err := bcrypt.GenerateFromPassword([]byte(token), bcrypt.DefaultCost)
	if err != nil {
		return "", "", err
	}
	return token, string(hash), nil
}
