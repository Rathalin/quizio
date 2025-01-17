package models

import "time"

type Question struct {
	UUID                string    `json:"uuid" required:"true"`
	CreatedAt           time.Time `json:"createdAt" required:"true"`
	UpdatedAt           time.Time `json:"updatedAt" required:"true"`
	Title               string    `json:"title" required:"true"`
	Description         *string   `json:"description,omitempty" nullable:"false"`
	ImageUrl            *string   `json:"imageUrl,omitempty" nullable:"false"`
	Explanation         *string   `json:"explanation,omitempty" nullable:"false"`
	ExplanationImageUrl *string   `json:"explanationImageUrl,omitempty" nullable:"false"`
	Answers             []Answer  `json:"answers" required:"true" nullable:"false"`
}
