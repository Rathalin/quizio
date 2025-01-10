package models

import "time"

type Answer struct {
	ID          string    `json:"id"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
	Title       string    `json:"text"`
	Description string    `json:"description"`
	ImageUrl    string    `json:"imageUrl"`
	IsCorrect   bool      `json:"isCorrect"`
}
