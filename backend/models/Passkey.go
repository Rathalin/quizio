package models

import "time"

type Passkey struct {
	CreatedAt    time.Time `json:"createdAt"`
	UpdatedAt    time.Time `json:"updatedAt"`
	CredentialID []byte    `json:"credentialId"`
	PublicKey    []byte    `json:"publicKey"`
	SignCount    int       `json:"signCount"`
}
