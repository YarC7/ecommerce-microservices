package routes

import (
	"go-microservices/cart-service/controller"
	"go-microservices/cart-service/middleware"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(r *gin.Engine, cc *controller.CartController) {
	r.GET("/health", func(c *gin.Context) { c.JSON(200, gin.H{"status": "ok"}) })

	r.POST("/cart", middleware.RequireAuth(), cc.AddToCart)
	r.GET("/cart/:customerId", middleware.RequireAuth(), cc.GetCart)
	// Update and delete by cart item id
	r.PUT("/cart/:id", middleware.RequireAuth(), cc.UpdateCartItem)
	r.DELETE("/cart/:id", middleware.RequireAuth(), cc.RemoveCartItem)
}