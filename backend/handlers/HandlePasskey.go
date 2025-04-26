package handlers

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/Rathalin/quizio/backend/auth"
	"github.com/go-webauthn/webauthn/protocol"
	"github.com/go-webauthn/webauthn/webauthn"
	"github.com/swaggest/usecase"
)

type WebAuthnUser struct {
	ID          int
	Username    string
	DisplayName string
	Credentials []webauthn.Credential
}

// WebAuthnID returns the unique ID for this user (as bytes)
func (u *WebAuthnUser) WebAuthnID() []byte {
	return []byte(fmt.Sprintf("%d", u.ID))
}

// WebAuthnName returns the username
func (u *WebAuthnUser) WebAuthnName() string {
	return u.Username
}

// WebAuthnDisplayName returns a display name (nice for showing in UI)
func (u *WebAuthnUser) WebAuthnDisplayName() string {
	return u.DisplayName
}

// WebAuthnCredentials returns a list of credentials the user has (passkeys)
func (u *WebAuthnUser) WebAuthnCredentials() []webauthn.Credential {
	return u.Credentials
}

func (dbw *DBWrapper) HandlePasskeyRegistrationOptions() usecase.Interactor {
	type passkeyRegistrationOptionsResponse struct {
		*protocol.CredentialCreation `json:",inline"`
	}

	return usecase.NewInteractor(func(ctx context.Context, _ struct{}, output *passkeyRegistrationOptionsResponse) error {
		// Step 1: Get current user ID from JWT/session
		userID, err := getUserIdFromContext(ctx)
		if err != nil {
			return logAndReturnError(err)
		}

		// Step 2: Fetch user from database
		var user struct {
			ID       int
			Username string
		}
		err = dbw.DB.QueryRowContext(ctx, `
			SELECT id, username
			FROM user_account
			WHERE id = $1
		`, userID).Scan(
			&user.ID,
			&user.Username,
		)
		if err != nil {
			return logAndReturnError(fmt.Errorf("failed to find user: %w", err))
		}

		// Step 3: Create a simple adapter to satisfy the WebAuthn User interface
		webAuthnUser := &WebAuthnUser{
			ID:          user.ID,
			Username:    user.Username,
			DisplayName: user.Username,           // or a nicer display name if you have one
			Credentials: []webauthn.Credential{}, // Empty for first registration
		}

		// Step 4: Begin registration (generate options)
		opts, sessionData, err := auth.WebAuthn.BeginRegistration(webAuthnUser)
		if err != nil {
			return logAndReturnError(fmt.Errorf("failed to begin registration: %w", err))
		}

		// Step 5: Save sessionData to a temporary passkey_session table
		sessionDataJson, err := json.Marshal(sessionData)
		if err != nil {
			return logAndReturnError(fmt.Errorf("failed to marshal session data: %w", err))
		}

		_, err = dbw.DB.ExecContext(ctx, `
					INSERT INTO passkey_session (user_account_id, session_data)
					VALUES ($1, $2)
			`, user.ID, sessionDataJson)
		if err != nil {
			return logAndReturnError(fmt.Errorf("failed to save session data: %w", err))
		}

		// Step 6: Return options to the frontend
		output.CredentialCreation = opts
		return nil
	})
}

// func (dbw *DBWrapper) HandlePasskeyRegistrationVerify() usecase.Interactor {
// 	type Input struct {
// 		Credential protocol.ParsedCredentialCreationData `json:"credential"`
// 	}

// 	type Output struct {
// 		Message string `json:"message"`
// 	}

// 	return usecase.NewInteractor(func(ctx context.Context, input Input, output *Output) error {
// 		user := YourUserLookupSomehow(ctx)

// 		sessionData := LoadSessionDataFromCache(user.ID)

// 		credential, err := auth.WebAuthn.FinishRegistration(user, sessionData, input.Credential)
// 		if err != nil {
// 			return err
// 		}

// 		err = dbw.StoreCredentialInDB(user.ID, credential)
// 		if err != nil {
// 			return err
// 		}

// 		output.Message = "Passkey registered successfully"
// 		return nil
// 	})
// }
