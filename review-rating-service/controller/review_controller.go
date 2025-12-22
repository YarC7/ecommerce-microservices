package controller

import (
	"database/sql"
	"net/http"
	"strconv"

	"go-microservices/review-rating-service/model"

	"github.com/gin-gonic/gin"
)

// ReviewController handles reviews and ratings
type ReviewController struct {
	DB *sql.DB
}

func NewReviewController(db *sql.DB) *ReviewController {
	return &ReviewController{DB: db}
}

func (rc *ReviewController) CreateReview(c *gin.Context) {
	var r model.Review
	if err := c.BindJSON(&r); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var id int
	err := rc.DB.QueryRow("INSERT INTO reviews (product_id, customer_id, rating, comment) VALUES ($1,$2,$3,$4) RETURNING id", r.ProductID, r.CustomerID, r.Rating, r.Comment).Scan(&id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	r.ID = id
	c.JSON(http.StatusCreated, r)
}

func (rc *ReviewController) GetReviewsByProduct(c *gin.Context) {
	productID := c.Param("productId")
	rows, err := rc.DB.Query("SELECT id, product_id, customer_id, rating, comment FROM reviews WHERE product_id = $1", productID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	var reviews []model.Review
	for rows.Next() {
		var r model.Review
		if err := rows.Scan(&r.ID, &r.ProductID, &r.CustomerID, &r.Rating, &r.Comment); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		reviews = append(reviews, r)
	}

	c.JSON(http.StatusOK, reviews)
}

func (rc *ReviewController) DeleteReview(c *gin.Context) {
	id := c.Param("id")
	result, err := rc.DB.Exec("DELETE FROM reviews WHERE id = $1", id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Review not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Review deleted"})
}