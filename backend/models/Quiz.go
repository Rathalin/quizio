package models

import "time"

type Quiz struct {
	UUID              string              `json:"uuid" required:"true"`
	CreatedAt         time.Time           `json:"createdAt" required:"true"`
	UpdatedAt         time.Time           `json:"updatedAt" required:"true"`
	Title             string              `json:"title" required:"true"`
	Description       *string             `json:"description,omitempty nullable:"false"`
	IsPublished       bool                `json:"isPublished" required:"true"`
	ImageUrl          *string             `json:"imageUrl,omitempty nullable:"false"`
	Questions         []Question          `json:"questions" required:"true"`
	PlayProtocolEntry []PlayProtocolEntry `json:"playProtocolEntry" required:"true"`
}
