package model

type SearchResult struct {
	ID    int     `json:"id"`
	Name  string  `json:"name"`
	Score float64 `json:"score"`
}