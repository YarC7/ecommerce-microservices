package db

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	_ "github.com/lib/pq"
)

func GetDB() *sql.DB {
	host := getEnv("DB_HOST", "logistics-db")
	port := getEnv("DB_PORT", "5442")
	user := getEnv("DB_USER", "postgres")
	password := getEnv("DB_PASSWORD", "canh177")
	dbname := getEnv("DB_NAME", "logistics_db")

	connStr := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		host, port, user, password, dbname)
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal(err)
	}

	if err := db.Ping(); err != nil {
		log.Fatal(err)
	}

	log.Println("Connected to logistics DB")
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
	CREATE TABLE IF NOT EXISTS shipments (
		id SERIAL PRIMARY KEY,
		order_id INTEGER NOT NULL,
		status TEXT NOT NULL
	);`

	if _, err := db.Exec(create); err != nil {
		log.Fatal(err)
	}

	log.Println("Shipments table ready")
}