package routes

import (
	"go-microservices/search-service/controller"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(r *gin.Engine, sc *controller.SearchController) {
	r.GET("/health", func(c *gin.Context) { c.JSON(200, gin.H{"status": "ok"}) })

	// Search endpoint
	r.GET("/search", sc.SearchProducts)
}