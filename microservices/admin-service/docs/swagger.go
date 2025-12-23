package docs

// @title Admin Service API
// @version 1.0
// @description Admin service API used for administrative user management
// @termsOfService http://swagger.io/terms/

// @contact.name API Support
// @contact.url http://www.swagger.io/support
// @contact.email support@swagger.io

// @host localhost:8086
// @BasePath /
// @schemes http

// @tag.name admins
// @tag.description Admin management endpoints

// GetAdmins godoc
// @Summary List admins
// @Tags admins
// @Produce json
// @Success 200 {array} map[string]interface{}
// @Router /admins [get]
func GetAdminsDoc() {}

// CreateAdmin godoc
// @Summary Create admin
// @Tags admins
// @Accept json
// @Produce json
// @Param admin body map[string]interface{} true "Admin object"
// @Success 201 {object} map[string]interface{}
// @Router /admins [post]
func CreateAdminDoc() {}