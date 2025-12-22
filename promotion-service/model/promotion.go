package model

type Promotion struct {
	ID       int     `json:"id"`
	Code     string  `json:"code"`
	Discount float64 `json:"discount"`
}