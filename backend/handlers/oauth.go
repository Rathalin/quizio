package handlers

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"net/http"
	"os"
	"sync"
	"time"

	"github.com/swaggest/usecase"
	"github.com/swaggest/usecase/status"
)

var (
	// authCodes maps auth code -> user ID
	authCodes sync.Map
)

// GenerateAuthCode generates a random hex string for the auth code.
func generateAuthCode() string {
	b := make([]byte, 16)
	rand.Read(b)
	return hex.EncodeToString(b)
}

// OAuthAuthorizeHandler just redirects to the frontend login mask.
func (dbw *DBWrapper) OAuthAuthorizeHandler() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		clientID := r.URL.Query().Get("client_id")
		redirectURI := r.URL.Query().Get("redirect_uri")
		state := r.URL.Query().Get("state")

		frontendURL := os.Getenv("QUIZIO_FRONTEND_URL")
		if frontendURL == "" {
			frontendURL = "http://localhost:3000"
		}

		// Redirect to Next.js frontend to handle login and consent
		target := fmt.Sprintf("%s/oauth-login?client_id=%s&redirect_uri=%s&state=%s",
			frontendURL, clientID, redirectURI, state)
		http.Redirect(w, r, target, http.StatusFound)
	}
}

// OAuthGrant creates an auth code for an authenticated user.
func (dbw *DBWrapper) OAuthGrant() usecase.Interactor {
	type grantRequest struct {
		ClientID    string `json:"client_id" required:"true"`
		RedirectURI string `json:"redirect_uri" required:"true"`
		State       string `json:"state"`
	}

	type grantResponse struct {
		Code  string `json:"code" required:"true"`
		State string `json:"state"`
	}

	return usecase.NewInteractor(func(ctx context.Context, input grantRequest, output *grantResponse) error {
		userID, err := getUserIdFromContext(ctx)
		if err != nil {
			return status.Wrap(err, status.Unauthenticated)
		}

		code := generateAuthCode()
		
		// Store code -> userID for 5 minutes
		authCodes.Store(code, userID)
		
		go func(c string) {
			time.Sleep(5 * time.Minute)
			authCodes.Delete(c)
		}(code)

		output.Code = code
		output.State = input.State
		return nil
	})
}

// OAuthToken exchanges the auth code for a standard JWT token.
func (dbw *DBWrapper) OAuthToken() usecase.Interactor {
	type tokenRequest struct {
		GrantType   string `formData:"grant_type" json:"grant_type"`
		Code        string `formData:"code" json:"code" required:"true"`
		RedirectURI string `formData:"redirect_uri" json:"redirect_uri"`
		ClientID    string `formData:"client_id" json:"client_id"`
	}

	type tokenResponse struct {
		AccessToken string `json:"access_token" required:"true"`
		TokenType   string `json:"token_type" required:"true"`
		ExpiresIn   int    `json:"expires_in" required:"true"`
	}

	return usecase.NewInteractor(func(ctx context.Context, input tokenRequest, output *tokenResponse) error {
		userIDAny, ok := authCodes.Load(input.Code)
		if !ok {
			return status.Wrap(fmt.Errorf("invalid or expired authorization code"), status.InvalidArgument)
		}
		
		userID := userIDAny.(int64)

		// Code is single-use
		authCodes.Delete(input.Code)

		accessToken, err := generateJWT(userID)
		if err != nil {
			return status.Wrap(err, status.Internal)
		}

		output.AccessToken = accessToken
		output.TokenType = "Bearer"
		output.ExpiresIn = 3600 // 1 hour

		return nil
	})
}

