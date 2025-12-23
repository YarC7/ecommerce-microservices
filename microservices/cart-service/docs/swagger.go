package docs

// @title Cart Service API
// @version 1.0
// @description Cart service API for managing shopping carts
// @termsOfService http://swagger.io/terms/

// @contact.name API Support
// @contact.url http://www.swagger.io/support
// @contact.email support@swagger.io

// @host localhost:8087
// @BasePath /
// @schemes http

// @tag.name cart
// @tag.description Cart management endpoints

// AddToCart godoc
// @Summary Add item to cart
// @Tags cart
// @Accept json
// @Produce json
// @Param item body map[string]interface{} true "Cart item"
// @Success 201 {object} map[string]interface{}
// @Router /cart [post]
func AddToCartDoc() {}

// GetCart godoc
// @Summary Get customer cart
// @Tags cart
// @Produce json
// @Param customerId path int true "Customer ID"
// @Success 200 {array} map[string]interface{}
// @Router /cart/{customerId} [get]
func GetCartDoc() {}