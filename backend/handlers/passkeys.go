package handlers

import (
	"context"
	"encoding/json"
	"net/http"
	"time"

	"github.com/go-webauthn/webauthn/protocol"
	"github.com/go-webauthn/webauthn/webauthn"
	"github.com/swaggest/usecase"
	"github.com/swaggest/usecase/status"

	"github.com/Rathalin/quizio/backend/auth"
)

// In-memory session store for webauthn sessions
// In a highly-available production environment, this should be backed by Redis or Postgres.
var webAuthnSessionData = map[string]*webauthn.SessionData{}

func (dbw *DBWrapper) StartPasskeyRegistration() usecase.Interactor {
	return usecase.NewInteractor(func(ctx context.Context, input struct{}, output *protocol.CredentialCreation) error {
		userID, err := getUserIdFromContext(ctx)
		if err != nil {
			return status.Wrap(logAndReturnError(err), status.Unauthenticated)
		}

		userUUID, err := dbw.GetUserUuid(userID)
		if err != nil {
			return status.Wrap(logAndReturnError(err), status.Unauthenticated)
		}

		userAccount, err := dbw.getUserAccountByUUID(userUUID)
		if err != nil {
			return logAndReturnError(err)
		}

		creation, sessionData, err := auth.WebAuthn.BeginRegistration(userAccount)
		if err != nil {
			return logAndReturnError(err)
		}

		// Store session data using the user's UUID
		webAuthnSessionData[userUUID] = sessionData

		*output = *creation
		return nil
	})
}

func (dbw *DBWrapper) FinishPasskeyRegistration(w http.ResponseWriter, request *http.Request) {
	userID, err := getUserIdFromContext(request.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}

	userUUID, err := dbw.GetUserUuid(userID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}

	userAccount, err := dbw.getUserAccountByUUID(userUUID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	sessionData, ok := webAuthnSessionData[userUUID]
	if !ok {
		http.Error(w, "session data not found", http.StatusPreconditionFailed)
		return
	}

	credential, err := auth.WebAuthn.FinishRegistration(userAccount, *sessionData, request)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Store credential in database
	_, err = dbw.DB.ExecContext(request.Context(), `
		INSERT INTO passkey (user_account_id, credential_id, public_key, sign_count)
		VALUES ($1, $2, $3, $4)
	`, userID, credential.ID, credential.PublicKey, credential.Authenticator.SignCount)
	
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Cleanup session
	delete(webAuthnSessionData, userUUID)

	w.Header().Set("Content-Type", "application/json")
	w.Write([]byte(`{"success":true}`))
}

func (dbw *DBWrapper) StartPasskeyLogin() usecase.Interactor {
	type startPasskeyLoginRequest struct {
		Username string `json:"username" required:"true"`
	}
	return usecase.NewInteractor(func(ctx context.Context, input startPasskeyLoginRequest, output *protocol.CredentialAssertion) error {
		if err := validate.Struct(input); err != nil {
			return status.Wrap(logAndReturnError(err), status.InvalidArgument)
		}

		userAccount, err := dbw.getUserAccountByUsername(input.Username)
		if err != nil {
			return status.Wrap(logAndReturnErrorMessage("invalid username or passkey"), status.Unauthenticated)
		}

		// Pre-flight check: does this user have any passkeys?
		if len(userAccount.WebAuthnCredentials()) == 0 {
			return status.Wrap(logAndReturnErrorMessage("no passkeys found for user"), status.Unauthenticated)
		}

		assertion, sessionData, err := auth.WebAuthn.BeginLogin(userAccount)
		if err != nil {
			return logAndReturnError(err)
		}

		// Store session data using the user's UUID
		webAuthnSessionData[userAccount.UUID] = sessionData

		*output = *assertion
		return nil
	})
}

func (dbw *DBWrapper) FinishPasskeyLogin(w http.ResponseWriter, request *http.Request) {
	parsedResponse, err := protocol.ParseCredentialRequestResponseBody(request.Body)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Look up user_account_id by parsedResponse.RawID (this is the credential ID)
	var userAccountId int64
	err = dbw.DB.QueryRowContext(request.Context(), `
		SELECT user_account_id FROM passkey WHERE credential_id = $1
	`, parsedResponse.RawID).Scan(&userAccountId)
	if err != nil {
		http.Error(w, "invalid passkey", http.StatusUnauthorized)
		return
	}

	userUuid, err := dbw.GetUserUuid(userAccountId)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	userAccount, err := dbw.getUserAccountByUUID(userUuid)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	sessionData, ok := webAuthnSessionData[userUuid]
	if !ok {
		http.Error(w, "session data not found", http.StatusPreconditionFailed)
		return
	}

	credential, err := auth.WebAuthn.ValidateLogin(userAccount, *sessionData, parsedResponse)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Update sign count
	_, err = dbw.DB.ExecContext(request.Context(), `
		UPDATE passkey
		SET sign_count = $1, updated_at = NOW()
		WHERE credential_id = $2
	`, credential.Authenticator.SignCount, credential.ID)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Generate access token
	accessToken, err := generateJWT(userAccountId)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Generate refresh token
	refreshToken, err := generateRefreshToken(userAccountId)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	_, err = dbw.DB.Exec(`
		INSERT INTO refresh_token (user_account_id, token, expires_at)
		VALUES ($1, $2, $3)
	`, userAccountId, refreshToken, time.Now().Add(7*24*time.Hour))
	
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Cleanup session
	delete(webAuthnSessionData, userUuid)

	resp := map[string]interface{}{
		"uuid": userUuid,
		"accessToken": accessToken,
		"refreshToken": refreshToken,
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
