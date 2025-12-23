package controller

import (
	"bytes"
	"database/sql"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

func setupControllerWithMock(t *testing.T) (*AuthController, sqlmock.Sqlmock, func()) {
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("failed to open sqlmock db: %v", err)
	}
	ac := NewAuthController(db)
	cleanup := func() { _ = db.Close() }
	return ac, mock, cleanup
}

func TestRevoke_BySessionID_Admin(t *testing.T) {
	ac, mock, cleanup := setupControllerWithMock(t)
	defer cleanup()

	// Expect Exec to revoke session
	mock.ExpectExec("UPDATE sessions SET revoked = TRUE WHERE id = \$1").WithArgs(123).
		WillReturnResult(sqlmock.NewResult(0, 1))

	// Prepare request
	reqBody := map[string]interface{}{"session_id": 123}
	b, _ := json.Marshal(reqBody)
	req := httptest.NewRequest("POST", "/auth/revoke", bytes.NewReader(b))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-User-Roles", "admin")

	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = req

	ac.Revoke(c)

	if w.Code != http.StatusOK {
		t.Fatalf("expected status 200 got %d: %s", w.Code, w.Body.String())
	}
	var resp map[string]string
	if err := json.Unmarshal(w.Body.Bytes(), &resp); err != nil {
		t.Fatalf("invalid JSON response: %v", err)
	}
	if msg, ok := resp["message"]; !ok || msg != "session revoked" {
		t.Fatalf("unexpected response message: %v", resp)
	}

	if err := mock.ExpectationsWereMet(); err != nil {
		t.Fatalf("unmet expectations: %v", err)
	}
}

func TestRevoke_ByRefreshToken_User(t *testing.T) {
	ac, mock, cleanup := setupControllerWithMock(t)
	defer cleanup()

	// Create a token and its bcrypt hash to simulate DB-stored hash
	token := "test-refresh-token-123"
	hash, _ := bcrypt.GenerateFromPassword([]byte(token), bcrypt.DefaultCost)

	// Expect query to list active sessions and return one matching hashed token
	expires := time.Now().Add(1 * time.Hour)
	rows := sqlmock.NewRows([]string{"id", "user_id", "refresh_token_hash", "expires_at", "revoked"}).
		AddRow(1, 11, string(hash), expires, false)
	mock.ExpectQuery("SELECT id, user_id, refresh_token_hash, expires_at, revoked FROM sessions WHERE revoked = FALSE").WillReturnRows(rows)

	// Expect Exec to revoke the found session
	mock.ExpectExec("UPDATE sessions SET revoked = TRUE WHERE id = \$1").WithArgs(1).
		WillReturnResult(sqlmock.NewResult(0, 1))

	// Prepare request
	reqBody := map[string]interface{}{"refresh_token": token}
	b, _ := json.Marshal(reqBody)
	req := httptest.NewRequest("POST", "/auth/revoke", bytes.NewReader(b))
	req.Header.Set("Content-Type", "application/json")

	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = req

	ac.Revoke(c)

	if w.Code != http.StatusOK {
		t.Fatalf("expected status 200 got %d: %s", w.Code, w.Body.String())
	}
	var resp map[string]string
	if err := json.Unmarshal(w.Body.Bytes(), &resp); err != nil {
		t.Fatalf("invalid JSON response: %v", err)
	}
	if msg, ok := resp["message"]; !ok || msg != "revoked" {
		t.Fatalf("unexpected response message: %v", resp)
	}

	if err := mock.ExpectationsWereMet(); err != nil {
		t.Fatalf("unmet expectations: %v", err)
	}
}

func TestListSessions_Admin(t *testing.T) {
	ac, mock, cleanup := setupControllerWithMock(t)
	defer cleanup()

	// Prepare rows returned by sessions query
	expires := time.Now().Add(24 * time.Hour)
	created := time.Now().Add(-1 * time.Hour)
	rows := sqlmock.NewRows([]string{"id", "user_id", "email", "expires_at", "revoked", "created_at"}).
		AddRow(1, 10, "user1@example.com", expires, false, created).
		AddRow(2, 11, "user2@example.com", expires, true, created)
	mock.ExpectQuery("SELECT s.id, s.user_id, u.email, s.expires_at, s.revoked, s.created_at FROM sessions s JOIN users u ON u.id = s.user_id ORDER BY s.created_at DESC").WillReturnRows(rows)

	req := httptest.NewRequest("GET", "/auth/sessions", nil)
	req.Header.Set("X-User-Roles", "admin")

	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = req

	ac.ListSessions(c)

	if w.Code != http.StatusOK {
		t.Fatalf("expected status 200 got %d: %s", w.Code, w.Body.String())
	}

	var resp []map[string]interface{}
	if err := json.Unmarshal(w.Body.Bytes(), &resp); err != nil {
		t.Fatalf("invalid JSON response: %v", err)
	}
	if len(resp) != 2 {
		t.Fatalf("expected 2 sessions, got %d", len(resp))
	}

	if err := mock.ExpectationsWereMet(); err != nil {
		t.Fatalf("unmet expectations: %v", err)
	}
}
