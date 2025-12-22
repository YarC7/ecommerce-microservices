package main

import (
	"log"

	"go-microservices/admin-service/controller"
	"go-microservices/admin-service/db"
	"go-microservices/admin-service/routes"

	"github.com/gin-gonic/gin"
)

func main() {
	// Initialize database connection
	database := db.GetDB()
	defer database.Close()

	// Initialize database schema
	db.InitSchema(database)

	// Create admin controller
	adminController := controller.NewAdminController(database)

	// Initialize router
	router := gin.Default()

	// Setup routes








}	}		log.Fatal("Failed to start server: ", err)	if err := router.Run(":8086"); err != nil {	log.Println("Admin Service starting on port 8086...")	// Start serveroutes.SetupRoutes(router, adminController)