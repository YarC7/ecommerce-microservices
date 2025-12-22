package routes

import (
	"go-microservices/cart-service/controller"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(r *gin.Engine, cc *controller.CartController) {
	r.GET("/health", func(c *gin.Context) { c.JSON(200, gin.H{"status": "ok"}) })

	r.POST("/cart", cc.AddToCart)
	r.GET("/cart/:customerId", cc.GetCart)
	// Update and delete by cart item id
	r.PUT("/cart/:id", cc.UpdateCartItem)
	r.DELETE("/cart/:id", cc.RemoveCartItem)
}