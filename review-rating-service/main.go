package main

import (
	"log"

	"go-microservices/review-rating-service/controller"
	"go-microservices/review-rating-service/db"
	"go-microservices/review-rating-service/routes"

	"github.com/gin-gonic/gin"
)

func main() {
	database := db.GetDB()
	defer database.Close()

	db.InitSchema(database)

	reviewController := controller.NewReviewController(database)

	router := gin.Default()

	routes.SetupRoutes(router, reviewController)

	log.Println("Review & Rating Service starting on port 8088...")
	if err := router.Run(":8088"); err != nil {
		log.Fatal("Failed to start server: ", err)
	}
}