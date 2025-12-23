package main

import (
	"log"

	"go-microservices/search-service/controller"
	"go-microservices/search-service/db"
	"go-microservices/search-service/routes"

	"github.com/gin-gonic/gin"
)

func main() {
	database := db.GetDB()
	defer database.Close()

	db.InitSchema(database)

	searchController := controller.NewSearchController(database)

	router := gin.Default()

	routes.SetupRoutes(router, searchController)

	log.Println("Search Service starting on port 8089...")
	if err := router.Run(":8089"); err != nil {
		log.Fatal("Failed to start server: ", err)
	}
}