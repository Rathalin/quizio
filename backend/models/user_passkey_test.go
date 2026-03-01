package models

import (
	"bytes"
	"testing"
	"time"
)

func TestUserPasskey_ToWebAuthnCredential(t *testing.T) {
	tests := []struct {
		name           string
		backupEligible bool
		backupState    bool
	}{
		{
			name:           "both false (e.g. device bound passkey like Windows Hello)",
			backupEligible: false,
			backupState:    false,
		},
		{
			name:           "eligible but not backed up",
			backupEligible: true,
			backupState:    false,
		},
		{
			name:           "both true (e.g. syncable passkey like Apple Keychain or Google Password Manager)",
			backupEligible: true,
			backupState:    true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			up := UserPasskey{
				ID:             1,
				UserAccountID:  10,
				CredentialID:   []byte("test_cred_id"),
				PublicKey:      []byte("test_public_key"),
				SignCount:      42,
				CreatedAt:      time.Now(),
				UpdatedAt:      time.Now(),
				BackupEligible: tt.backupEligible,
				BackupState:    tt.backupState,
			}

			cred := up.ToWebAuthnCredential()

			if !bytes.Equal(cred.ID, up.CredentialID) {
				t.Errorf("CredentialID mismatch: got %v, want %v", cred.ID, up.CredentialID)
			}
			if !bytes.Equal(cred.PublicKey, up.PublicKey) {
				t.Errorf("PublicKey mismatch: got %v, want %v", cred.PublicKey, up.PublicKey)
			}
			if cred.Authenticator.SignCount != uint32(up.SignCount) {
				t.Errorf("SignCount mismatch: got %v, want %v", cred.Authenticator.SignCount, up.SignCount)
			}
			if cred.Flags.BackupEligible != tt.backupEligible {
				t.Errorf("BackupEligible mismatch: got %v, want %v", cred.Flags.BackupEligible, tt.backupEligible)
			}
			if cred.Flags.BackupState != tt.backupState {
				t.Errorf("BackupState mismatch: got %v, want %v", cred.Flags.BackupState, tt.backupState)
			}
		})
	}
}
