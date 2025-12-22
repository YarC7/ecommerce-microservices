package routes

import (
	"go-microservices/admin-service/controller"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(r *gin.Engine, ac *controller.AdminController) {
	r.GET("/health", func(c *gin.Context) { c.JSON(200, gin.H{"status": "ok"}) })

	r.GET("/admins", ac.GetAdmins)
	r.GET("/admins/:id", ac.GetAdmin)
	// Use POST /admins to create
	r.POST("/admins", ac.CreateAdmin)
	r.PUT("/admins/:id", ac.UpdateAdmin)
	r.DELETE("/admins/:id", ac.DeleteAdmin)
}