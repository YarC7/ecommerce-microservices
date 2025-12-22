package main

import (
	"log"

	"go-microservices/logistics-service/controller"
	"go-microservices/logistics-service/db"
	"go-microservices/logistics-service/routes"

	"github.com/gin-gonic/gin"
)

func main() {
	database := db.GetDB()
	defer database.Close()

	db.InitSchema(database)

	logisticsController := controller.NewLogisticsController(database)

	router := gin.Default()

	routes.SetupRoutes(router, logisticsController)

	log.Println("Logistics Service starting on port 8090...")
	if err := router.Run(":8090"); err != nil {
		log.Fatal("Failed to start server: ", err)
	}
}