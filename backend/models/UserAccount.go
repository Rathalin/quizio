package models

import "time"

type UserAccount struct {
	// ID              int       `json:"id"`
	UUID            string    `json:"uuid"`
	CreatedAt       time.Time `json:"createdAt"`
	UpdatedAt       time.Time `json:"updatedAt"`
	Username        string    `json:"username"`
	PasswordHash    string    `json:"passwordHash"`
	PasswordSalt    string    `json:"passwordSalt"`
	IsConfirmed     bool      `json:"isConfirmed"`
	IsBlocked       bool      `json:"isBlocked"`
	ProfileImageUrl string    `json:"profileImageUrl"`
}
