package controller

import (
	"bytes"
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"go-microservices/payment-service/model"

	"github.com/gin-gonic/gin"
	"github.com/stripe/stripe-go/v76"
	"github.com/stripe/stripe-go/v76/paymentintent"
)

type PaymentController struct {
	db *sql.DB
}

func NewPaymentController(db *sql.DB) *PaymentController {
	// Initialize Stripe if configured; otherwise, run in stub mode (useful for integration tests)
	stripeKey := os.Getenv("STRIPE_SECRET_KEY")
	if stripeKey == "" {
		log.Println("Warning: STRIPE_SECRET_KEY not set — running payment service in stub mode")
	} else {
		stripe.Key = stripeKey
	}
		db: db,
	}
}

// CreatePayment creates a new payment intent with Stripe
func (pc *PaymentController) CreatePayment(c *gin.Context) {
	var req model.PaymentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Enforce ownership: prefer X-User-Id header as customer ID
	uid := c.GetHeader("X-User-Id")
	if uid == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "authentication required"})
		return
	}
	if req.CustomerID != 0 {
		if strconv.Itoa(req.CustomerID) != uid {
			c.JSON(http.StatusForbidden, gin.H{"error": "cannot create payment for another user"})
			return
		}
	} else {
		cid, _ := strconv.Atoi(uid)
		req.CustomerID = cid
	}

	// Convert amount to cents for Stripe (Stripe expects amounts in cents)
	amountCents := int64(req.Amount * 100)

	var pi *stripe.PaymentIntent
	var err error
	if stripe.Key == "" {
		// Stub mode: generate fake payment intent
		pi = &stripe.PaymentIntent{
			ID:           "pi_stub_" + strconv.FormatInt(time.Now().UnixNano(), 10),
			ClientSecret: "secret_stub_" + strconv.FormatInt(time.Now().UnixNano(), 10),
			Status:       stripe.PaymentIntentStatusRequiresPaymentMethod,
		}
	} else {
		// Create payment intent with Stripe
		params := &stripe.PaymentIntentParams{
			Amount:   stripe.Int64(amountCents),
			Currency: stripe.String(req.Currency),
			Metadata: map[string]string{
				"order_id":    strconv.Itoa(req.OrderID),
				"customer_id": strconv.Itoa(req.CustomerID),
			},
		}

		pi, err = paymentintent.New(params)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create payment intent: " + err.Error()})
			return
		}
	}

	// Save payment to database
	payment := model.Payment{
		OrderID:            req.OrderID,
		CustomerID:         req.CustomerID,
		Amount:             req.Amount,
		Currency:           req.Currency,
		Status:             model.PaymentStatusPending,
		StripePaymentID:    pi.ID,
		StripeClientSecret: pi.ClientSecret,
		CreatedAt:          time.Now(),
		UpdatedAt:          time.Now(),
	}

	query := `
		INSERT INTO payments (order_id, customer_id, amount, currency, status, stripe_payment_id, stripe_client_secret, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		RETURNING id
	`

	err = pc.db.QueryRow(query, payment.OrderID, payment.CustomerID, payment.Amount, payment.Currency, 
		payment.Status, payment.StripePaymentID, payment.StripeClientSecret, payment.CreatedAt, payment.UpdatedAt).Scan(&payment.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save payment: " + err.Error()})
		return
	}

	response := model.PaymentResponse{
		Payment:      payment,
		ClientSecret: pi.ClientSecret,
		Message:      "Payment intent created successfully",
	}

	c.JSON(http.StatusCreated, response)
}

// ConfirmPayment confirms a payment and updates the status
func (pc *PaymentController) ConfirmPayment(c *gin.Context) {
	var req model.PaymentConfirmRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Retrieve payment intent from Stripe or stub
	var pi *stripe.PaymentIntent
	var err error
	if stripe.Key == "" {
		// Stub: assume success
		pi = &stripe.PaymentIntent{ID: req.PaymentIntentID, Status: stripe.PaymentIntentStatusSucceeded, PaymentMethod: &stripe.PaymentMethod{Type: "card"}}
	} else {
		pi, err = paymentintent.Get(req.PaymentIntentID, nil)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve payment intent: " + err.Error()})
			return
		}
	}

	// Fetch existing payment to enforce ownership
	var existing model.Payment
	err = pc.db.QueryRow("SELECT id, order_id, customer_id FROM payments WHERE stripe_payment_id = $1", req.PaymentIntentID).
		Scan(&existing.ID, &existing.OrderID, &existing.CustomerID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch payment: " + err.Error()})
		return
	}

	uid := c.GetHeader("X-User-Id")
	roles := c.GetHeader("X-User-Roles")
	if uid == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "authentication required"})
		return
	}
	if strconv.Itoa(existing.CustomerID) != uid && !strings.Contains(roles, "admin") {
		c.JSON(http.StatusForbidden, gin.H{"error": "forbidden"})
		return
	}

	// Update payment status in database
	status := model.PaymentStatusPending
	switch pi.Status {
	case stripe.PaymentIntentStatusSucceeded:
		status = model.PaymentStatusSucceeded
	case stripe.PaymentIntentStatusCanceled:
		status = model.PaymentStatusCanceled
	case stripe.PaymentIntentStatusProcessing:
		status = model.PaymentStatusPending
	default:
		status = model.PaymentStatusFailed
	}

	query := `
		UPDATE payments 
		SET status = $1, payment_method = $2, updated_at = $3
		WHERE stripe_payment_id = $4
		RETURNING id, order_id, customer_id, amount, currency, status, stripe_payment_id, payment_method, created_at, updated_at
	`

	var payment model.Payment
	err = pc.db.QueryRow(query, status, string(pi.PaymentMethod.Type), time.Now(), pi.ID).Scan(
		&payment.ID, &payment.OrderID, &payment.CustomerID, &payment.Amount, &payment.Currency,
		&payment.Status, &payment.StripePaymentID, &payment.PaymentMethod, &payment.CreatedAt, &payment.UpdatedAt,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update payment: " + err.Error()})
		return
	}

	response := model.PaymentResponse{
		Payment: payment,
		Message: "Payment status updated successfully",
	}

	// If payment succeeded, attempt to update order status to 'completed'
	if status == model.PaymentStatusSucceeded {
		go func(orderID int, customerID int) {
			orderServiceURL := getEnv("ORDER_SERVICE_URL", "http://order-service:8081")
			url := fmt.Sprintf("%s/orders/%d/status", orderServiceURL, orderID)
			body := map[string]string{"status": "completed"}
			b, _ := json.Marshal(body)
			req, _ := http.NewRequest("PATCH", url, bytes.NewReader(b))
			req.Header.Set("Content-Type", "application/json")
			// Set X-User-Id header so ownership checks pass
			req.Header.Set("X-User-Id", strconv.Itoa(customerID))
			client := &http.Client{Timeout: 10 * time.Second}
			resp, err := client.Do(req)
			if err != nil {
				log.Printf("Failed to notify order service about payment success: %v\n", err)
				return
			}
			defer resp.Body.Close()
			if resp.StatusCode != http.StatusOK {
				log.Printf("Order service returned non-OK status when updating status: %d\n", resp.StatusCode)
			}
		}(payment.OrderID, payment.CustomerID)
	}

	c.JSON(http.StatusOK, response)
}

// GetPayment retrieves a payment by ID
func (pc *PaymentController) GetPayment(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid payment ID"})
		return
	}

	query := `
		SELECT id, order_id, customer_id, amount, currency, status, stripe_payment_id, 
		       COALESCE(payment_method, '') as payment_method, created_at, updated_at
		FROM payments WHERE id = $1
	`

	var payment model.Payment
	err = pc.db.QueryRow(query, id).Scan(
		&payment.ID, &payment.OrderID, &payment.CustomerID, &payment.Amount, &payment.Currency,
		&payment.Status, &payment.StripePaymentID, &payment.PaymentMethod, &payment.CreatedAt, &payment.UpdatedAt,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			c.JSON(http.StatusNotFound, gin.H{"error": "Payment not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve payment: " + err.Error()})
		return
	}

	// Ownership: allow owner or admin
	uid := c.GetHeader("X-User-Id")
	roles := c.GetHeader("X-User-Roles")
	if uid == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "authentication required"})
		return
	}
	if strconv.Itoa(payment.CustomerID) != uid && !strings.Contains(roles, "admin") {
		c.JSON(http.StatusForbidden, gin.H{"error": "forbidden"})
		return
	}

	c.JSON(http.StatusOK, payment)
}

// GetPaymentsByOrder retrieves all payments for an order
func (pc *PaymentController) GetPaymentsByOrder(c *gin.Context) {
	orderIDParam := c.Param("orderId")
	orderID, err := strconv.Atoi(orderIDParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid order ID"})
		return
	}

	// Ownership: non-admins only see their own payments
	uid := c.GetHeader("X-User-Id")
	roles := c.GetHeader("X-User-Roles")
	if uid == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "authentication required"})
		return
	}

	var rows *sql.Rows
	if strings.Contains(roles, "admin") {
		query := `
			SELECT id, order_id, customer_id, amount, currency, status, stripe_payment_id,
			       COALESCE(payment_method, '') as payment_method, created_at, updated_at
			FROM payments WHERE order_id = $1 ORDER BY created_at DESC
		`
		rows, err = pc.db.Query(query, orderID)
	} else {
		cid, _ := strconv.Atoi(uid)
		query := `
			SELECT id, order_id, customer_id, amount, currency, status, stripe_payment_id,
			       COALESCE(payment_method, '') as payment_method, created_at, updated_at
			FROM payments WHERE order_id = $1 AND customer_id = $2 ORDER BY created_at DESC
		`
		rows, err = pc.db.Query(query, orderID, cid)
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve payments: " + err.Error()})
		return
	}
	defer rows.Close()

	var payments []model.Payment
	for rows.Next() {
		var payment model.Payment
		err := rows.Scan(
			&payment.ID, &payment.OrderID, &payment.CustomerID, &payment.Amount, &payment.Currency,
			&payment.Status, &payment.StripePaymentID, &payment.PaymentMethod, &payment.CreatedAt, &payment.UpdatedAt,
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to scan payment: " + err.Error()})
			return
		}
		payments = append(payments, payment)
	}

	c.JSON(http.StatusOK, payments)
}

// HealthCheck returns the health status of the payment service
func (pc *PaymentController) HealthCheck(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"status":  "ok",
		"service": "payment-service",
		"time":    time.Now().UTC(),
	})
}

// getEnv gets an environment variable or returns a default value
func getEnv(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}