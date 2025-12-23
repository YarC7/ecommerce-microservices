package controller

import (
	"database/sql"
	"net/http"
	"strconv"

	"go-microservices/customer-service/model"

	"github.com/gin-gonic/gin"
)

// CustomerController handles customer-related requests
type CustomerController struct {
	DB *sql.DB
}

// NewCustomerController creates a new customer controller
func NewCustomerController(db *sql.DB) *CustomerController {
	return &CustomerController{DB: db}
}

// CreateCustomer handles creation of a new customer
func (cc *CustomerController) CreateCustomer(c *gin.Context) {
	var customer model.Customer
	if err := c.BindJSON(&customer); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var id int
	err := cc.DB.QueryRow(
		"INSERT INTO customers (name, email) VALUES ($1, $2) RETURNING id",
		customer.Name, customer.Email).Scan(&id)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	customer.ID = id
	c.JSON(http.StatusCreated, customer)
}

// GetCustomers returns all customers
func (cc *CustomerController) GetCustomers(c *gin.Context) {
	rows, err := cc.DB.Query("SELECT id, name, email FROM customers")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	var customers []model.Customer
	for rows.Next() {
		var cust model.Customer
		if err := rows.Scan(&cust.ID, &cust.Name, &cust.Email); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		customers = append(customers, cust)
	}

	c.JSON(http.StatusOK, customers)
}

// GetCustomer returns a specific customer by ID
func (cc *CustomerController) GetCustomer(c *gin.Context) {
	id := c.Param("id")
	var customer model.Customer

	err := cc.DB.QueryRow("SELECT id, name, email FROM customers WHERE id = $1", id).
		Scan(&customer.ID, &customer.Name, &customer.Email)

	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": "Customer not found"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, customer)
}

// UpdateCustomer updates a customer
func (cc *CustomerController) UpdateCustomer(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	var customer model.Customer
	if err := c.BindJSON(&customer); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	result, err := cc.DB.Exec("UPDATE customers SET name = $1, email = $2 WHERE id = $3",
		customer.Name, customer.Email, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Customer not found"})
		return
	}

	customer.ID = id
	c.JSON(http.StatusOK, customer)
}

// DeleteCustomer deletes a customer
func (cc *CustomerController) DeleteCustomer(c *gin.Context) {
	id := c.Param("id")

	result, err := cc.DB.Exec("DELETE FROM customers WHERE id = $1", id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Customer not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Customer deleted successfully"})
}