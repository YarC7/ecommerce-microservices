package controller

import (
	"database/sql"
	"net/http"
	"strconv"

	"go-microservices/admin-service/model"

	"github.com/gin-gonic/gin"
)

// AdminController handles admin-related requests
type AdminController struct {
	DB *sql.DB
}

// NewAdminController creates a new admin controller
func NewAdminController(db *sql.DB) *AdminController {
	return &AdminController{DB: db}
}

// CreateAdmin handles creation of a new admin
func (ac *AdminController) CreateAdmin(c *gin.Context) {
	var admin model.Admin
	if err := c.BindJSON(&admin); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var id int
	err := ac.DB.QueryRow(
		"INSERT INTO admins (username, role) VALUES ($1, $2) RETURNING id",
		admin.Username, admin.Role).Scan(&id)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	admin.ID = id
	c.JSON(http.StatusCreated, admin)
}

// GetAdmins returns all admins
func (ac *AdminController) GetAdmins(c *gin.Context) {
	rows, err := ac.DB.Query("SELECT id, username, role FROM admins")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	var admins []model.Admin
	for rows.Next() {
		var adm model.Admin
		if err := rows.Scan(&adm.ID, &adm.Username, &adm.Role); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		admins = append(admins, adm)
	}

	c.JSON(http.StatusOK, admins)
}

// GetAdmin returns a specific admin by ID
func (ac *AdminController) GetAdmin(c *gin.Context) {
	id := c.Param("id")
	var admin model.Admin

	err := ac.DB.QueryRow("SELECT id, username, role FROM admins WHERE id = $1", id).
		Scan(&admin.ID, &admin.Username, &admin.Role)

	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": "Admin not found"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, admin)
}

// UpdateAdmin updates an admin
func (ac *AdminController) UpdateAdmin(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	var admin model.Admin
	if err := c.BindJSON(&admin); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	result, err := ac.DB.Exec("UPDATE admins SET username = $1, role = $2 WHERE id = $3",
		admin.Username, admin.Role, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Admin not found"})
		return
	}

	admin.ID = id
	c.JSON(http.StatusOK, admin)
}

// DeleteAdmin deletes an admin
func (ac *AdminController) DeleteAdmin(c *gin.Context) {
	id := c.Param("id")

	result, err := ac.DB.Exec("DELETE FROM admins WHERE id = $1", id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Admin not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Admin deleted successfully"})
}