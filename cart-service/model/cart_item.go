package model

type CartItem struct {
	ID         int `json:"id"`
	CustomerID int `json:"customerId"`
	ProductID  int `json:"productId"`
	Quantity   int `json:"quantity"`
}