package models

import (
	"time"

	"github.com/go-webauthn/webauthn/webauthn"
)

type UserPasskey struct {
	ID            int64     `json:"id" required:"true"`
	UserAccountID int64     `json:"userAccountId" required:"true"`
	CredentialID  []byte    `json:"credentialId" required:"true"`
	PublicKey     []byte    `json:"publicKey" required:"true"`
	SignCount     int64     `json:"signCount" required:"true"`
	CreatedAt     time.Time `json:"createdAt" required:"true"`
	UpdatedAt     time.Time `json:"updatedAt" required:"true"`
}

func (up *UserPasskey) ToWebAuthnCredential() webauthn.Credential {
	return webauthn.Credential{
		ID:              up.CredentialID,
		PublicKey:       up.PublicKey,
		AttestationType: "none", // Since we don't store the exact attestation type, defaulting to none which is safe
		Transport:       nil,
		Flags: webauthn.CredentialFlags{
			UserPresent:    true,
			UserVerified:   true,
			BackupEligible: true,
			BackupState:    true,
		},
		Authenticator: webauthn.Authenticator{
			AAGUID:       []byte{},
			SignCount:    uint32(up.SignCount),
			CloneWarning: false,
		},
	}
}
