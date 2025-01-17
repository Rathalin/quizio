package models

import "time"

type Question struct {
	UUID                string    `json:"uuid" required:"true"`
	CreatedAt           time.Time `json:"createdAt" required:"true"`
	UpdatedAt           time.Time `json:"updatedAt" required:"true"`
	Title               string    `json:"title" required:"true"`
	Description         *string   `json:"description" required:"true" nullable:"true"`
	ImageUrl            *string   `json:"imageUrl" required:"true" nullable:"true"`
	Explanation         *string   `json:"explanation" required:"true" nullable:"true"`
	ExplanationImageUrl *string   `json:"explanationImageUrl" required:"true" nullable:"true"`
	Answers             []Answer  `json:"answers" required:"true" nullable:"false"`
}
