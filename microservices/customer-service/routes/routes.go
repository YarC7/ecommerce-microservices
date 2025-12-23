package routes

import (
	"go-microservices/customer-service/controller"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(r *gin.Engine, cc *controller.CustomerController) {
	r.GET("/health", func(c *gin.Context) { c.JSON(200, gin.H{"status": "ok"}) })

	r.GET("/customers", cc.GetCustomers)
	r.GET("/customers/:id", cc.GetCustomer)
	// Use POST /customers to create
	r.POST("/customers", cc.CreateCustomer)
	r.PUT("/customers/:id", cc.UpdateCustomer)
	r.DELETE("/customers/:id", cc.DeleteCustomer)
}