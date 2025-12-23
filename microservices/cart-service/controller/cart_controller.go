package controller

import (
	"database/sql"
	"net/http"
	"strconv"

	"go-microservices/cart-service/model"

	"github.com/gin-gonic/gin"
)

// CartController handles cart-related requests
type CartController struct {
	DB *sql.DB
}

// NewCartController creates a new cart controller
func NewCartController(db *sql.DB) *CartController {
	return &CartController{DB: db}
}

// AddToCart adds an item to the cart
func (cc *CartController) AddToCart(c *gin.Context) {
	var item model.CartItem
	if err := c.BindJSON(&item); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var id int
	err := cc.DB.QueryRow(
		"INSERT INTO cart_items (customer_id, product_id, quantity) VALUES ($1, $2, $3) RETURNING id",
		item.CustomerID, item.ProductID, item.Quantity).Scan(&id)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	item.ID = id
	c.JSON(http.StatusCreated, item)
}

// GetCart returns items for a customer
func (cc *CartController) GetCart(c *gin.Context) {
	customerID := c.Param("customerId")
	rows, err := cc.DB.Query("SELECT id, customer_id, product_id, quantity FROM cart_items WHERE customer_id = $1", customerID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	var items []model.CartItem
	for rows.Next() {
		var it model.CartItem
		if err := rows.Scan(&it.ID, &it.CustomerID, &it.ProductID, &it.Quantity); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		items = append(items, it)
	}

	c.JSON(http.StatusOK, items)
}

// UpdateCartItem updates quantity
func (cc *CartController) UpdateCartItem(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	var item model.CartItem
	if err := c.BindJSON(&item); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	result, err := cc.DB.Exec("UPDATE cart_items SET quantity = $1 WHERE id = $2", item.Quantity, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Cart item not found"})
		return
	}

	item.ID = id
	c.JSON(http.StatusOK, item)
}

// RemoveCartItem deletes an item
func (cc *CartController) RemoveCartItem(c *gin.Context) {
	id := c.Param("id")

	result, err := cc.DB.Exec("DELETE FROM cart_items WHERE id = $1", id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Cart item not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Cart item deleted successfully"})
}