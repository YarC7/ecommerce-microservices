package model

type Review struct {
	ID         int    `json:"id"`
	ProductID  int    `json:"productId"`
	CustomerID int    `json:"customerId"`
	Rating     int    `json:"rating"`
	Comment    string `json:"comment"`
}