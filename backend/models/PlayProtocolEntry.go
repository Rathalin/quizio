package models

import "time"

type PlayProtocolEntry struct {
	UUID      string    `json:"uuid" required:"true"`
	CreatedAt time.Time `json:"createdAt" required:"true"`
	UpdatedAt time.Time `json:"updatedAt" required:"true"`
	PlayedAt  time.Time `json:"playedAt" required:"true"`
}
