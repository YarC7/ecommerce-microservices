package docs

// @title Logistics Service API
// @version 1.0
// @description Logistics service for shipments and tracking
// @contact.name API Support
// @contact.email support@swagger.io
// @host localhost:8090
// @BasePath /

// @tag.name logistics
// @tag.description Logistics endpoints

// CreateShipment godoc
// @Summary Create shipment
// @Tags logistics
// @Accept json
// @Produce json
// @Param shipment body map[string]interface{} true "Shipment object"
// @Success 201 {object} map[string]interface{}
// @Router /shipments [post]
func CreateShipmentDoc() {}

// GetShipment godoc
// @Summary Get shipment status
// @Tags logistics
// @Produce json
// @Param id path int true "Shipment ID"
// @Success 200 {object} map[string]interface{}
// @Router /shipments/{id} [get]
func GetShipmentDoc() {}