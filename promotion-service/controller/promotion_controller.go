package controller

import (
	"database/sql"
	"net/http"
	"strconv"

	"go-microservices/promotion-service/model"

	"github.com/gin-gonic/gin"
)

// PromotionController handles promotions
type PromotionController struct {
	DB *sql.DB
}

func NewPromotionController(db *sql.DB) *PromotionController {
	return &PromotionController{DB: db}
}

func (pc *PromotionController) CreatePromotion(c *gin.Context) {
	var p model.Promotion
	if err := c.BindJSON(&p); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var id int
	err := pc.DB.QueryRow("INSERT INTO promotions (code, discount) VALUES ($1, $2) RETURNING id", p.Code, p.Discount).Scan(&id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	p.ID = id
	c.JSON(http.StatusCreated, p)
}

func (pc *PromotionController) GetPromotions(c *gin.Context) {
	rows, err := pc.DB.Query("SELECT id, code, discount FROM promotions")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	var promos []model.Promotion
	for rows.Next() {
		var p model.Promotion
		if err := rows.Scan(&p.ID, &p.Code, &p.Discount); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		promos = append(promos, p)
	}

	c.JSON(http.StatusOK, promos)
}

func (pc *PromotionController) DeletePromotion(c *gin.Context) {
	id := c.Param("id")
	result, err := pc.DB.Exec("DELETE FROM promotions WHERE id = $1", id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Promotion not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Promotion deleted successfully"})
}