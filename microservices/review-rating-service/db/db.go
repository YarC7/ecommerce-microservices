package db

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	_ "github.com/lib/pq"
)

func GetDB() *sql.DB {
	host := getEnv("DB_HOST", "review-db")
	port := getEnv("DB_PORT", "5440")
	user := getEnv("DB_USER", "postgres")
	password := getEnv("DB_PASSWORD", "canh177")
	dbname := getEnv("DB_NAME", "reviews_db")

	connStr := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		host, port, user, password, dbname)
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal(err)
	}

	if err := db.Ping(); err != nil {
		log.Fatal(err)
	}

	log.Println("Connected to review DB")
	return db
}

func getEnv(key, defaultValue string) string {
	v := os.Getenv(key)
	if v == "" {
		return defaultValue
	}
	return v
}

func InitSchema(db *sql.DB) {
	create := `
	CREATE TABLE IF NOT EXISTS reviews (
		id SERIAL PRIMARY KEY,
		product_id INTEGER NOT NULL,
		customer_id INTEGER NOT NULL,
		rating INTEGER NOT NULL,
		comment TEXT
	);`

	if _, err := db.Exec(create); err != nil {
		log.Fatal(err)
	}

	log.Println("Reviews table ready")
}