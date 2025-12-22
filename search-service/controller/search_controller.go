package controller

import (
	"database/sql"
	"net/http"

	"github.com/gin-gonic/gin"
)

// SearchController handles search requests
type SearchController struct {
	DB *sql.DB
}

func NewSearchController(db *sql.DB) *SearchController {
	return &SearchController{DB: db}
}

func (sc *SearchController) SearchProducts(c *gin.Context) {
	q := c.Query("q")
	// Placeholder: in a real service, you'd query an index or database
	results := []map[string]interface{}{
		{"id": 1, "name": "Example Product", "score": 0.9, "query": q},
	}
	c.JSON(http.StatusOK, results)
}