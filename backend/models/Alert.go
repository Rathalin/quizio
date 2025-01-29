package models

import "time"

type Alert struct {
	UUID            string    `json:"uuid" required:"true"`
	CreatedAt       time.Time `json:"createdAt" required:"true"`
	UpdatedAt       time.Time `json:"updatedAt" required:"true"`
	MarkdownContent string    `json:"markdownContent" required:"true"`
	Severity        string    `json:"severity" enum:"success,info,warning,error" required:"true"`
	ImageUrl        *string   `json:"imageUrl" required:"true" nullable:"true"`
	ImageSize       *string   `json:"imageSize" enum:"small,medium,large" required:"true" nullable:"true"`
	IsActive        bool      `json:"isActive" required:"true"`
	VisibleTo       string    `json:"visibleTo" required:"true" enum:"everyone,authorized"`
}
