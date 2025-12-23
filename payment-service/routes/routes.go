package routes

import (
	"go-microservices/payment-service/controller"
	"go-microservices/payment-service/middleware"

	"github.com/gin-gonic/gin"
)

// SetupRoutes configures the payment service routes
func SetupRoutes(router *gin.Engine, paymentController *controller.PaymentController) {
	// Health check
	router.GET("/health", paymentController.HealthCheck)

	// Payment routes
	paymentRoutes := router.Group("/payments")
	{
		paymentRoutes.POST("/", middleware.RequireAuth(), paymentController.CreatePayment)            // Create payment intent
		paymentRoutes.POST("/confirm", middleware.RequireAuth(), paymentController.ConfirmPayment)    // Confirm payment
		paymentRoutes.GET("/:id", middleware.RequireAuth(), paymentController.GetPayment)            // Get payment by ID
		paymentRoutes.GET("/order/:orderId", middleware.RequireAuth(), paymentController.GetPaymentsByOrder) // Get payments by order ID
	}
}