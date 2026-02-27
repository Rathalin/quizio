package models

import (
	"time"

	"github.com/go-webauthn/webauthn/webauthn"
)

type UserAccount struct {
	UUID            string    `json:"uuid" required:"true"`
	CreatedAt       time.Time `json:"createdAt" required:"true"`
	UpdatedAt       time.Time `json:"updatedAt" required:"true"`
	Username        string    `json:"username" required:"true"`
	IsConfirmed     bool      `json:"isConfirmed" required:"true"`
	IsBlocked       bool      `json:"isBlocked" required:"true"`
	ProfileImageUrl *string   `json:"profileImageUrl" required:"true" nullable:"true"`

	// These are not persisted with UserAccount directly but injected at runtime
	passkeyCredentials []webauthn.Credential `json:"-"`
}

// WebAuthn User Interface Implementation
func (u *UserAccount) WebAuthnID() []byte {
	// WebAuthn ID needs to be stable and unique.
	// Since ID is likely a DB primary key, returning the user UUID as bytes.
	return []byte(u.UUID)
}

func (u *UserAccount) WebAuthnName() string {
	return u.Username
}

func (u *UserAccount) WebAuthnDisplayName() string {
	return u.Username // Or a separate display name field
}

// WebAuthnIcon is mostly deprecated but required by interface
func (u *UserAccount) WebAuthnIcon() string {
	if u.ProfileImageUrl != nil {
		return *u.ProfileImageUrl
	}
	return ""
}

func (u *UserAccount) WebAuthnCredentials() []webauthn.Credential {
	return u.passkeyCredentials
}

func (u *UserAccount) AddPasskeyCredentials(creds []webauthn.Credential) {
	u.passkeyCredentials = append(u.passkeyCredentials, creds...)
}
