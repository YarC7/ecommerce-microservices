package main

import (
	"fmt"
	"net/http"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v4"
)

// jwtMiddleware validates a Bearer JWT and adds user info to headers
func jwtMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		auth := c.GetHeader("Authorization")
		if auth == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "missing authorization header"})
			return
		}
		parts := strings.SplitN(auth, " ", 2)
		if len(parts) != 2 || strings.ToLower(parts[0]) != "bearer" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid authorization header"})
			return
		}
		tok := parts[1]
		secret := os.Getenv("JWT_SECRET")
		if secret == "" {
			c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "JWT_SECRET not configured"})
			return
		}

		parsed, err := jwt.Parse(tok, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, jwt.ErrTokenMalformed
			}
			return []byte(secret), nil
		})
		if err != nil || !parsed.Valid {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid token"})
			return
		}
		claims, ok := parsed.Claims.(jwt.MapClaims)
		if !ok {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid token claims"})
			return
		}
		if uid, ok := claims["user_id" ]; ok {
			c.Request.Header.Set("X-User-Id", toString(uid))
		}
		if roles, ok := claims["roles"]; ok {
			c.Request.Header.Set("X-User-Roles", toString(roles))
		}
		c.Next()
	}
}

// adminRequired ensures the user has the 'admin' role
func adminRequired() gin.HandlerFunc {
	return func(c *gin.Context) {
		roles := c.Request.Header.Get("X-User-Roles")
		if roles == "" || !strings.Contains(roles, "admin") {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "admin role required"})
			return
		}
		c.Next()
	}
}

func toString(v interface{}) string {
	switch vv := v.(type) {
	case string:
		return vv
	case float64:
		// jwt numeric values are float64
		return fmtFloat64(vv)
	default:
		return ""
	}
}

func fmtFloat64(f float64) string {
	return strings.TrimRight(strings.TrimRight(fmt.Sprintf("%f", f), "0"), ".")
}
