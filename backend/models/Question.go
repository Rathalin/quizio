package models

import "time"

type Question struct {
	// ID                  string    `json:"id"`
	CreatedAt           time.Time `json:"createdAt"`
	UpdatedAt           time.Time `json:"updatedAt"`
	Title               string    `json:"text"`
	Description         *string   `json:"description,omitempty"`
	ImageUrl            *string   `json:"imageUrl,omitempty"`
	Explanation         *string   `json:"explanation,omitempty"`
	ExplanationImageUrl *string   `json:"explanationImageUrl,omitempty"`
	Answers             []Answer  `json:"answers"`
}
