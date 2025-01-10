package models

import "time"

type Answer struct {
	UUID        string    `json:"uuid" required:"true"`
	CreatedAt   time.Time `json:"created_at" required:"true"`
	UpdatedAt   time.Time `json:"updated_at" required:"true"`
	Title       string    `json:"title" required:"true"`
	Description *string   `json:"description,omitempty"`
	ImageUrl    *string   `json:"imageUrl,omitempty"`
	IsCorrect   bool      `json:"isCorrect" required:"true"`
}
