package db

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	_ "github.com/lib/pq"
)

// GetDB returns a database connection
func GetDB() *sql.DB {
	host := getEnv("DB_HOST", "auth-db")
	port := getEnv("DB_PORT", "5432")
	user := getEnv("DB_USER", "postgres")
	password := getEnv("DB_PASSWORD", "password")
	dbname := getEnv("DB_NAME", "auth_db")

	connStr := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		host, port, user, password, dbname)
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal(err)
	}

	// Ping to verify connection
	err = db.Ping()
	if err != nil {
		log.Fatal(err)
	}

	log.Println("Successfully connected to the auth database")
	return db
}

// getEnv gets an environment variable or returns a default value
func getEnv(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}

// InitSchema initializes the database schema
func InitSchema(db *sql.DB) {
	createUsers := `
	CREATE TABLE IF NOT EXISTS users (
		id SERIAL PRIMARY KEY,
		email TEXT NOT NULL UNIQUE,
		password_hash TEXT NOT NULL,
		roles TEXT DEFAULT 'user',
		created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() at time zone 'utc')
	);`

	_, err := db.Exec(createUsers)
	if err != nil {
		log.Fatal(err)
	}

	createSessions := `
	CREATE TABLE IF NOT EXISTS sessions (
		id SERIAL PRIMARY KEY,
		user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
		refresh_token_hash TEXT NOT NULL,
		expires_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
		revoked BOOLEAN DEFAULT FALSE,
		created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() at time zone 'utc')
	);`

	_, err = db.Exec(createSessions)
	if err != nil {
		log.Fatal(err)
	}

	log.Println("Auth database schema initialized")
}
