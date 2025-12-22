package main

import (
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"

	"github.com/gin-gonic/gin"
)

// Service information structure
type Service struct {
	URL  string
	Name string
}

// Configuration for our gateway
var (
	productServiceURL      = getEnv("PRODUCT_SERVICE_URL", "http://product-service:8080")
	orderServiceURL        = getEnv("ORDER_SERVICE_URL", "http://order-service:8081")
	inventoryServiceURL    = getEnv("INVENTORY_SERVICE_URL", "http://inventory-service:8082")
	notificationServiceURL = getEnv("NOTIFICATION_SERVICE_URL", "http://notification-service:8083")
	paymentServiceURL      = getEnv("PAYMENT_SERVICE_URL", "http://payment-service:8084")
	customerServiceURL     = getEnv("CUSTOMER_SERVICE_URL", "http://customer-service:8085")
	adminServiceURL        = getEnv("ADMIN_SERVICE_URL", "http://admin-service:8086")
	cartServiceURL         = getEnv("CART_SERVICE_URL", "http://cart-service:8087")
	reviewServiceURL       = getEnv("REVIEW_SERVICE_URL", "http://review-rating-service:8088")
	searchServiceURL       = getEnv("SEARCH_SERVICE_URL", "http://search-service:8089")
	logisticsServiceURL    = getEnv("LOGISTICS_SERVICE_URL", "http://logistics-service:8090")
	promotionServiceURL    = getEnv("PROMOTION_SERVICE_URL", "http://promotion-service:8091")
)

// List of our services
var services = []Service{
	{URL: productServiceURL, Name: "product"},
	{URL: orderServiceURL, Name: "order"},
	{URL: inventoryServiceURL, Name: "inventory"},
	{URL: notificationServiceURL, Name: "notification"},
	{URL: paymentServiceURL, Name: "payment"},
}

func main() {
	r := gin.Default()

	// Serve static files from the client/dist directory (Vite build output)
	clientDistPath := getEnv("CLIENT_DIST_PATH", "./client/dist")
	r.Static("/assets", clientDistPath+"/assets")
	r.StaticFile("/", clientDistPath+"/index.html")
	r.StaticFile("/favicon.ico", clientDistPath+"/favicon.ico")

	// CORS middleware
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, PATCH, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	// Health check endpoint
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status": "ok",
		})
	})

	// API routes - Gateway to microservices
	// V1 API group
	apiV1 := r.Group("/api/v1")

	// Handle requests to specific microservices
	// Products
	apiV1.Any("/products/*path", createReverseProxy(productServiceURL, "/products"))

	// Orders
	apiV1.Any("/orders/*path", createReverseProxy(orderServiceURL, "/orders"))

	// Inventory
	apiV1.Any("/inventory/*path", createReverseProxy(inventoryServiceURL, "/inventory"))

	// Notifications
	apiV1.Any("/notifications/*path", createReverseProxy(notificationServiceURL, "/notifications"))

	// Payments
	apiV1.Any("/payments/*path", createReverseProxy(paymentServiceURL, "/payments"))

	// New services proxies
	apiV1.Any("/customers/*path", createReverseProxy(customerServiceURL, "/customers"))
	apiV1.Any("/admins/*path", createReverseProxy(adminServiceURL, "/admins"))
	apiV1.Any("/cart/*path", createReverseProxy(cartServiceURL, "/cart"))
	apiV1.Any("/reviews/*path", createReverseProxy(reviewServiceURL, "/reviews"))
	apiV1.Any("/search/*path", createReverseProxy(searchServiceURL, "/search"))
	apiV1.Any("/logistics/*path", createReverseProxy(logisticsServiceURL, "/shipments"))
	apiV1.Any("/promotions/*path", createReverseProxy(promotionServiceURL, "/promotions"))

	// Documentation endpoint (moved to /api to avoid clashing with the SPA root)
	r.GET("/api", func(c *gin.Context) {
		// List available endpoints
		endpoints := map[string][]string{
			"products": {
				"GET /api/v1/products - List all products",
				"GET /api/v1/products/:id - Get product details",
				"POST /api/v1/products - Create new product",
				"PUT /api/v1/products/:id - Update product",
				"DELETE /api/v1/products/:id - Delete product",
			},
			"orders": {
				"GET /api/v1/orders - List all orders",
				"GET /api/v1/orders/:id - Get order details",
				"POST /api/v1/orders - Create new order",
				"PUT /api/v1/orders/:id - Update order",
				"DELETE /api/v1/orders/:id - Delete order",
				"PATCH /api/v1/orders/:id/status - Update order status",
			},
			"inventory": {
				"GET /api/v1/inventory - List all inventory items",
				"GET /api/v1/inventory/:id - Get inventory item details",
				"POST /api/v1/inventory - Create new inventory item",
				"PUT /api/v1/inventory/:id - Update inventory item",
				"DELETE /api/v1/inventory/:id - Delete inventory item",
				"POST /api/v1/inventory/check - Check product availability",
			},
			"notifications": {
				"GET /api/v1/notifications - List all notifications",
				"GET /api/v1/notifications/:id - Get notification details",
				"GET /api/v1/notifications/customer/:customerId - Get customer notifications",
				"POST /api/v1/notifications - Create notification",
				"PUT /api/v1/notifications/:id/deliver - Mark notification as delivered",
				"POST /api/v1/notifications/order-status - Process order status update",
			},
			"payments": {
				"POST /api/v1/payments - Create payment intent with Stripe",
				"POST /api/v1/payments/confirm - Confirm payment",
				"GET /api/v1/payments/:id - Get payment details",
				"GET /api/v1/payments/order/:orderId - Get payments by order ID",
			},
			"customers": {
				"GET /api/v1/customers - List all customers",
				"GET /api/v1/customers/:id - Get customer details",
				"POST /api/v1/customers - Create new customer",
				"PUT /api/v1/customers/:id - Update customer",
				"DELETE /api/v1/customers/:id - Delete customer",
			},
			"admins": {
				"GET /api/v1/admins - List all admins",
				"GET /api/v1/admins/:id - Get admin details",
				"POST /api/v1/admins - Create new admin",
				"PUT /api/v1/admins/:id - Update admin",
				"DELETE /api/v1/admins/:id - Delete admin",
			},
			"cart": {
				"POST /api/v1/cart - Add item to cart",
				"GET /api/v1/cart/:customerId - Get customer cart",
				"PUT /api/v1/cart/:id - Update cart item",
				"DELETE /api/v1/cart/:id - Remove cart item",
			},
			"reviews": {
				"POST /api/v1/reviews - Create review",
				"GET /api/v1/reviews/product/:productId - List product reviews",
				"DELETE /api/v1/reviews/:id - Delete review",
			},
			"search": {
				"GET /api/v1/search?q=... - Search products",
			},
			"logistics": {
				"POST /api/v1/shipments - Create shipment",
				"GET /api/v1/shipments/:id - Get shipment status",
			},
			"promotions": {
				"POST /api/v1/promotions - Create promotion",
				"GET /api/v1/promotions - List promotions",
				"DELETE /api/v1/promotions/:id - Delete promotion",
			},
		}

		c.JSON(http.StatusOK, gin.H{
			"name":      "Go Microservices API Gateway",
			"version":   "1.0",
			"endpoints": endpoints,
		})
	})

	port := getEnv("PORT", "8000")
	log.Printf("API Gateway starting on port %s...\n", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatal("Failed to start API Gateway: ", err)
	}
}

// getEnv gets an environment variable or returns a default value
func getEnv(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}

// createReverseProxy creates a gin handler function that forwards requests to the specified service
func createReverseProxy(serviceURL, stripPrefix string) gin.HandlerFunc {
	return func(c *gin.Context) {
		remote, err := url.Parse(serviceURL)
		if err != nil {
			log.Println("Error parsing service URL:", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not connect to service"})
			return
		}

		// Create the reverse proxy
		proxy := httputil.NewSingleHostReverseProxy(remote)

		// Update the headers to allow for SSL redirection
		c.Request.URL.Host = remote.Host
		c.Request.URL.Scheme = remote.Scheme

		// Remove the prefix from the path (e.g., /api/v1/products -> /products)
		path := c.Param("path")
		if path == "/" {
			path = ""
		}
		c.Request.URL.Path = stripPrefix + path

		log.Printf("Proxying request: %s %s -> %s\n", c.Request.Method, c.Request.URL.String(), serviceURL+path)

		// Serve the request using the proxy
		proxy.ServeHTTP(c.Writer, c.Request)
	}
}
