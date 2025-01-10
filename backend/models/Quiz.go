package models

import "time"

type Quiz struct {
	ID                int                 `json:"id"`
	CreatedAt         time.Time           `json:"createdAt"`
	UpdatedAt         time.Time           `json:"updatedAt"`
	UUID              string              `json:"uuid"`
	Title             string              `json:"title"`
	Description       string              `json:"description"`
	IsPublished       bool                `json:"isPublished"`
	ImageUrl          string              `json:"imageUrl"`
	Questions         []Question          `json:"questions"`
	PlayProtocolEntry []PlayProtocolEntry `json:"playProtocolEntry"`
}
