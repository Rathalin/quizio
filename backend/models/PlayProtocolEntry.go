package models

import "time"

type PlayProtocolEntry struct {
	ID        int       `json:"id"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
	PlayedAt  time.Time `json:"playedAt"`
}
