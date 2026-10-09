package handlers

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"fmt"
	"net"
	"net/http"
	"net/url"
	"slices"
	"sync"
	"time"

	"github.com/swaggest/usecase"
	"github.com/swaggest/usecase/status"

	"github.com/Rathalin/quizio/backend/auth"
	"github.com/Rathalin/quizio/backend/env"
)

const authCodeTTL = 5 * time.Minute

// authCodeEntry is the data bound to an issued authorization code.
type authCodeEntry struct {
	UserID              int64
	ClientID            string
	RedirectURI         string
	CodeChallenge       string
	CodeChallengeMethod string
}

var (
	// authCodes maps auth code -> authCodeEntry
	authCodes sync.Map
)

// allowedRedirectURIs contains non-loopback redirect URIs that MCP clients are allowed to use.
// Loopback redirect URIs (http://localhost:*, http://127.0.0.1:*, http://[::1]:*) are always allowed.
// Keep in sync with app/src/utilities/oauthUtils.ts.
var allowedRedirectURIs = []string{
	"https://vscode.dev/redirect",
	"https://insiders.vscode.dev/redirect",
	"https://claude.ai/api/mcp/auth_callback",
	"https://claude.com/api/mcp/auth_callback",
}

// IsValidClientRedirectURI reports whether the redirect URI is safe for the given client.
// It checks the static allowlist, loopback rules, and dynamic client registrations.
func IsValidClientRedirectURI(clientID, redirectURI string) bool {
	if slices.Contains(allowedRedirectURIs, redirectURI) {
		return true
	}

	u, err := url.Parse(redirectURI)
	if err == nil && u.Scheme == "http" && u.User == nil && u.Fragment == "" {
		host := u.Hostname()
		if host == "localhost" {
			return true
		}
		ip := net.ParseIP(host)
		if ip != nil && ip.IsLoopback() {
			return true
		}
	}

	if clientID != "" {
		token, err := auth.TokenAuth.Decode(clientID)
		if err == nil {
			if urisIf, ok := token.Get("redirect_uris"); ok {
				if uris, ok := urisIf.([]interface{}); ok {
					for _, uriIf := range uris {
						if uri, ok := uriIf.(string); ok && uri == redirectURI {
							return true
						}
					}
				}
			}
		}
	}

	return false
}

// generateAuthCode generates a random hex string for the auth code.
func generateAuthCode() (string, error) {
	b := make([]byte, 16)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return hex.EncodeToString(b), nil
}

// OAuthAuthorizeHandler validates the request and redirects to the frontend login/consent page.
func (dbw *DBWrapper) OAuthAuthorizeHandler() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		query := r.URL.Query()
		redirectURI := query.Get("redirect_uri")

		if !IsValidClientRedirectURI(query.Get("client_id"), redirectURI) {
			http.Error(w, "invalid redirect_uri", http.StatusBadRequest)
			return
		}

		params := url.Values{}
		params.Set("client_id", query.Get("client_id"))
		params.Set("redirect_uri", redirectURI)
		params.Set("state", query.Get("state"))
		params.Set("code_challenge", query.Get("code_challenge"))
		params.Set("code_challenge_method", query.Get("code_challenge_method"))
		params.Set("response_type", query.Get("response_type"))
		if query.Has("resource") {
			params.Set("resource", query.Get("resource"))
		}

		if clientID := query.Get("client_id"); clientID != "" {
			token, err := auth.TokenAuth.Decode(clientID)
			if err == nil {
				if clientName, ok := token.Get("client_name"); ok {
					if nameStr, ok := clientName.(string); ok {
						params.Set("client_name", nameStr)
					}
				}
			}
		}

		// Redirect to Next.js frontend to handle login and consent
		target := fmt.Sprintf("%s/oauth-login?%s", env.Config.APPURL, params.Encode())
		http.Redirect(w, r, target, http.StatusFound)
	}
}

// OAuthGrant creates an auth code for an authenticated user.
func (dbw *DBWrapper) OAuthGrant() usecase.Interactor {
	type grantRequest struct {
		ClientID            string `json:"client_id" required:"true"`
		RedirectURI         string `json:"redirect_uri" required:"true"`
		State               string `json:"state"`
		CodeChallenge       string `json:"code_challenge"`
		CodeChallengeMethod string `json:"code_challenge_method"`
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

		if !IsValidClientRedirectURI(input.ClientID, input.RedirectURI) {
			return status.Wrap(fmt.Errorf("invalid redirect_uri"), status.InvalidArgument)
		}

		code, err := generateAuthCode()
		if err != nil {
			return status.Wrap(err, status.Internal)
		}

		// Store code -> entry for a short time
		authCodes.Store(code, authCodeEntry{
			UserID:              userID,
			ClientID:            input.ClientID,
			RedirectURI:         input.RedirectURI,
			CodeChallenge:       input.CodeChallenge,
			CodeChallengeMethod: input.CodeChallengeMethod,
		})

		go func(c string) {
			time.Sleep(authCodeTTL)
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
		GrantType    string `formData:"grant_type" json:"grant_type"`
		Code         string `formData:"code" json:"code" required:"true"`
		RedirectURI  string `formData:"redirect_uri" json:"redirect_uri"`
		ClientID     string `formData:"client_id" json:"client_id"`
		CodeVerifier string `formData:"code_verifier" json:"code_verifier"`
	}

	type tokenResponse struct {
		AccessToken string `json:"access_token" required:"true"`
		TokenType   string `json:"token_type" required:"true"`
		ExpiresIn   int    `json:"expires_in" required:"true"`
	}

	return usecase.NewInteractor(func(ctx context.Context, input tokenRequest, output *tokenResponse) error {
		if input.GrantType != "" && input.GrantType != "authorization_code" {
			return status.Wrap(fmt.Errorf("unsupported grant_type"), status.InvalidArgument)
		}

		// LoadAndDelete: code is single-use, even if the request below fails
		entryAny, ok := authCodes.LoadAndDelete(input.Code)
		if !ok {
			return status.Wrap(fmt.Errorf("invalid or expired authorization code"), status.InvalidArgument)
		}
		entry := entryAny.(authCodeEntry)

		// RFC 6749 4.1.3: redirect_uri must be identical to the one used in the authorization request
		if input.RedirectURI != entry.RedirectURI {
			return status.Wrap(fmt.Errorf("redirect_uri mismatch"), status.InvalidArgument)
		}
		if input.ClientID != "" && input.ClientID != entry.ClientID {
			return status.Wrap(fmt.Errorf("client_id mismatch"), status.InvalidArgument)
		}

		// PKCE Validation
		if entry.CodeChallenge != "" {
			if input.CodeVerifier == "" {
				return status.Wrap(fmt.Errorf("code_verifier required"), status.InvalidArgument)
			}
			if entry.CodeChallengeMethod == "S256" {
				hash := sha256.Sum256([]byte(input.CodeVerifier))
				expectedChallenge := base64.RawURLEncoding.EncodeToString(hash[:])
				if input.CodeVerifier != entry.CodeChallenge && expectedChallenge != entry.CodeChallenge {
					return status.Wrap(fmt.Errorf("invalid code_verifier"), status.InvalidArgument)
				}
			} else {
				// Plain or undefined method fallback
				if input.CodeVerifier != entry.CodeChallenge {
					return status.Wrap(fmt.Errorf("invalid code_verifier"), status.InvalidArgument)
				}
			}
		}

		accessToken, err := generateJWT(entry.UserID)
		if err != nil {
			return status.Wrap(err, status.Internal)
		}

		output.AccessToken = accessToken
		output.TokenType = "Bearer"
		output.ExpiresIn = int(auth.AccessTokenTTL.Seconds())

		return nil
	})
}
