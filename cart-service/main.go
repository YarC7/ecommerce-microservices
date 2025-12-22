package main

import (
	"log"

	"go-microservices/cart-service/controller"
	"go-microservices/cart-service/db"
	"go-microservices/cart-service/routes"

	"github.com/gin-gonic/gin"
)

func main() {
	// Initialize database connection
	database := db.GetDB()
	defer database.Close()

	// Initialize database schema
	db.InitSchema(database)

	// Create cart controller
	cartController := controller.NewCartController(database)

	// Initialize router
	router := gin.Default()

	// Setup routes
	routes.SetupRoutes(router, cartController)

	// Start server
	log.Println("Cart Service starting on port 8087...")
	if err := router.Run(":8087"); err != nil {
		log.Fatal("Failed to start server: ", err)
	}
}