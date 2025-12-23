package routes

import (
	"go-microservices/review-rating-service/controller"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(r *gin.Engine, rc *controller.ReviewController) {
	r.GET("/health", func(c *gin.Context) { c.JSON(200, gin.H{"status": "ok"}) })

	r.POST("/reviews", rc.CreateReview)
	r.GET("/reviews/product/:productId", rc.GetReviewsByProduct)
	// Delete
	r.DELETE("/reviews/:id", rc.DeleteReview)
}