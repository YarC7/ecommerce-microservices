package routes

import (
	"go-microservices/logistics-service/controller"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(r *gin.Engine, lc *controller.LogisticsController) {
	r.GET("/health", func(c *gin.Context) { c.JSON(200, gin.H{"status": "ok"}) })

	r.POST("/shipments", lc.CreateShipment)
	r.GET("/shipments/:id", lc.GetShipment)
}