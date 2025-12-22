package docs

// @title Customer Service API
// @version 1.0
// @description Customer service API for managing customers
// @termsOfService http://swagger.io/terms/

// @contact.name API Support
// @contact.url http://www.swagger.io/support
// @contact.email support@swagger.io

// @host localhost:8085
// @BasePath /
// @schemes http

// @tag.name customers
// @tag.description Customer management endpoints

// GetCustomers godoc
// @Summary List customers
// @Tags customers
// @Produce json
// @Success 200 {array} map[string]interface{}
// @Router /customers [get]
func GetCustomersDoc() {}

// CreateCustomer godoc
// @Summary Create customer
// @Tags customers
// @Accept json
// @Produce json
// @Param customer body map[string]interface{} true "Customer object"
// @Success 201 {object} map[string]interface{}
// @Router /customers [post]
func CreateCustomerDoc() {}