package models

import "time"

type Question struct {
	ID                  string    `json:"id"`
	CreatedAt           time.Time `json:"createdAt"`
	UpdatedAt           time.Time `json:"updatedAt"`
	Title               string    `json:"text"`
	Description         string    `json:"description"`
	ImageUrl            string    `json:"imageUrl"`
	Explanation         string    `json:"explanation"`
	ExplanationImageUrl string    `json:"explanationImageUrl"`
	Answers             []Answer  `json:"answers"`
}
