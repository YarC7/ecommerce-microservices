package main

import (
	"log"

	"go-microservices/promotion-service/controller"
	"go-microservices/promotion-service/db"
	"go-microservices/promotion-service/routes"

	"github.com/gin-gonic/gin"
)

func main() {
	database := db.GetDB()
	defer database.Close()

	db.InitSchema(database)

	promoController := controller.NewPromotionController(database)

	router := gin.Default()

	routes.SetupRoutes(router, promoController)

	log.Println("Promotion Service starting on port 8091...")
	if err := router.Run(":8091"); err != nil {
		log.Fatal("Failed to start server: ", err)
	}
}