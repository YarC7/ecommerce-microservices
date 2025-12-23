package main

import (
	"log"

	"go-microservices/auth-service/controller"
	"go-microservices/auth-service/db"
	"go-microservices/auth-service/routes"

	"github.com/gin-gonic/gin"
)

func main() {
	// Initialize database connection
	database := db.GetDB()
	defer database.Close()

	// Initialize database schema
	db.InitSchema(database)

	// Create auth controller
	authController := controller.NewAuthController(database)

	// Initialize router
	router := gin.Default()

	// Setup routes
	routes.SetupRoutes(router, authController)

	// Start server
	log.Println("Auth Service starting on port 8070...")
	if err := router.Run(":8070"); err != nil {
		log.Fatal("Failed to start auth service: ", err)
	}
}
