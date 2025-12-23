package docs

// @title Promotion Service API
// @version 1.0
// @description Service for promotions and discounts
// @contact.name API Support
// @contact.email support@swagger.io
// @host localhost:8091
// @BasePath /

// @tag.name promotions
// @tag.description Promotion endpoints

// CreatePromotion godoc
// @Summary Create promotion
// @Tags promotions
// @Accept json
// @Produce json
// @Param promotion body map[string]interface{} true "Promotion object"
// @Success 201 {object} map[string]interface{}
// @Router /promotions [post]
func CreatePromotionDoc() {}

// GetPromotions godoc
// @Summary List promotions
// @Tags promotions
// @Produce json
// @Success 200 {array} map[string]interface{}
// @Router /promotions [get]
func GetPromotionsDoc() {}