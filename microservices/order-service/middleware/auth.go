package middleware

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// RequireAuth ensures X-User-Id header is present and sets user_id in context
func RequireAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		uid := c.GetHeader("X-User-Id")
		if uid == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "authentication required"})
			return
		}
		c.Set("user_id", uid)
		c.Next()
	}
}
