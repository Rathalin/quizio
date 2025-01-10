package models

import "time"

type Answer struct {
	// ID          string    `json:"id"`
	CreatedAt   time.Time `json:"created_at" required:"true"`
	UpdatedAt   time.Time `json:"updated_at" required:"true"`
	Title       string    `json:"text" required:"true"`
	Description *string   `json:"description,omitempty"`
	ImageUrl    *string   `json:"imageUrl,omitempty"`
	IsCorrect   bool      `json:"isCorrect" required:"true"`
}
