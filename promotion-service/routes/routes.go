package routes

import (
	"go-microservices/promotion-service/controller"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(r *gin.Engine, pc *controller.PromotionController) {
	r.GET("/health", func(c *gin.Context) { c.JSON(200, gin.H{"status": "ok"}) })

	r.POST("/promotions", pc.CreatePromotion)
	r.GET("/promotions", pc.GetPromotions)
	// Delete
	r.DELETE("/promotions/:id", pc.DeletePromotion)
}