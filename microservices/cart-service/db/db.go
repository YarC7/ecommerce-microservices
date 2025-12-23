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
	host := getEnv("DB_HOST", "cart-db")
	port := getEnv("DB_PORT", "5439")
	user := getEnv("DB_USER", "postgres")
	password := getEnv("DB_PASSWORD", "canh177")
	dbname := getEnv("DB_NAME", "cart_db")

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

	log.Println("Successfully connected to the cart database")
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
	createTableSQL := `
	CREATE TABLE IF NOT EXISTS cart_items (
		id SERIAL PRIMARY KEY,
		customer_id INTEGER NOT NULL,
		product_id INTEGER NOT NULL,
		quantity INTEGER NOT NULL
	);`

	_, err := db.Exec(createTableSQL)
	if err != nil {
		log.Fatal(err)
	}

	log.Println("Cart items table created or already exists")
}