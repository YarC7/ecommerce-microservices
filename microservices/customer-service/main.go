package main

import (
	"log"

	"go-microservices/customer-service/controller"
	"go-microservices/customer-service/db"
	"go-microservices/customer-service/routes"

	"github.com/gin-gonic/gin"
)

func main() {
	// Initialize database connection
	database := db.GetDB()
	defer database.Close()

	// Initialize database schema
	db.InitSchema(database)

	// Create customer controller
	customerController := controller.NewCustomerController(database)

	// Initialize router
	router := gin.Default()

	// Setup routes
	routes.SetupRoutes(router, customerController)

	// Start server
	log.Println("Customer Service starting on port 8085...")
	if err := router.Run(":8085"); err != nil {
		log.Fatal("Failed to start server: ", err)
	}
}