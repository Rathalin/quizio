package models

import "time"

type Answer struct {
	UUID        string    `json:"uuid" required:"true"`
	CreatedAt   time.Time `json:"created_at" required:"true"`
	UpdatedAt   time.Time `json:"updated_at" required:"true"`
	Title       string    `json:"title" required:"true"`
	Description *string   `json:"description" required:"true" nullable:"true"`
	ImageUrl    *string   `json:"imageUrl" required:"true" nullable:"true"`
	IsCorrect   bool      `json:"isCorrect" required:"true"`
}
