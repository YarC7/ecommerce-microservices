package model

type Shipment struct {
	ID     int    `json:"id"`
	OrderID int   `json:"orderId"`
	Status string `json:"status"`
}