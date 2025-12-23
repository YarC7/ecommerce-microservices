package docs

// @title Review & Rating Service API
// @version 1.0
// @description Service for product reviews and ratings
// @contact.name API Support
// @contact.email support@swagger.io
// @host localhost:8088
// @BasePath /

// @tag.name reviews
// @tag.description Review and rating endpoints

// CreateReview godoc
// @Summary Create review
// @Tags reviews
// @Accept json
// @Produce json
// @Param review body map[string]interface{} true "Review object"
// @Success 201 {object} map[string]interface{}
// @Router /reviews [post]
func CreateReviewDoc() {}

// GetReviewsByProduct godoc
// @Summary List reviews for product
// @Tags reviews
// @Produce json
// @Param productId path int true "Product ID"
// @Success 200 {array} map[string]interface{}
// @Router /reviews/product/{productId} [get]
func GetReviewsByProductDoc() {}