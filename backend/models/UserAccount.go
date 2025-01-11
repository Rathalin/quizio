package models

import "time"

type UserAccount struct {
	UUID            string    `json:"uuid" required:"true"`
	CreatedAt       time.Time `json:"createdAt" required:"true"`
	UpdatedAt       time.Time `json:"updatedAt" required:"true"`
	Username        string    `json:"username" required:"true"`
	IsConfirmed     bool      `json:"isConfirmed" required:"true"`
	IsBlocked       bool      `json:"isBlocked" required:"true"`
	ProfileImageUrl *string   `json:"profileImageUrl,omitempty"`
}
