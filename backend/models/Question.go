package models

import "time"

type Question struct {
	UUID                string    `json:"uuid" required:"true"`
	CreatedAt           time.Time `json:"createdAt" required:"true"`
	UpdatedAt           time.Time `json:"updatedAt" required:"true"`
	Title               string    `json:"title" required:"true"`
	Description         *string   `json:"description,omitempty"`
	ImageUrl            *string   `json:"imageUrl,omitempty"`
	Explanation         *string   `json:"explanation,omitempty"`
	ExplanationImageUrl *string   `json:"explanationImageUrl,omitempty"`
	Answers             []Answer  `json:"answers" required:"true" nullable:"false"`
}
