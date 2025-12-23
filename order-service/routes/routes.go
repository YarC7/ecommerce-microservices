package routes

import (
	"go-microservices/order-service/controller"
		"go-microservices/order-service/middleware"

	"github.com/gin-gonic/gin"
)

// SetupRoutes configures the API routes for the order service
func SetupRoutes(router *gin.Engine, orderController *controller.OrderController) {
	// Order routes
	// Require authentication for order creation and modifications
	router.POST("/orders", middleware.RequireAuth(), orderController.CreateOrder)
	router.POST("/orders/with-payment", middleware.RequireAuth(), orderController.CreateOrderWithPayment)
	router.POST("/orders/batch", middleware.RequireAuth(), orderController.CreateBatchOrders)
	router.GET("/orders", orderController.GetOrders)
	router.GET("/orders/:id", middleware.RequireAuth(), orderController.GetOrder)
	router.PUT("/orders/:id", middleware.RequireAuth(), orderController.UpdateOrder)
	router.DELETE("/orders/:id", middleware.RequireAuth(), orderController.DeleteOrder)
	router.PATCH("/orders/:id/status", middleware.RequireAuth(), orderController.UpdateOrderStatus)
}
