package routes

import (
	"go-microservices/auth-service/controller"

	"github.com/gin-gonic/gin"
)

// SetupRoutes configures auth endpoints
func SetupRoutes(r *gin.Engine, ac *controller.AuthController) {
	r := r.Group("/auth")
	{
		r.POST("/register", ac.Register)
		r.POST("/login", ac.Login)
		r.POST("/refresh", ac.Refresh)
		r.POST("/logout", ac.Logout)
		r.POST("/revoke", ac.Revoke)
		r.GET("/sessions", ac.ListSessions)
	}
}
