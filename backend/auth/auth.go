package auth

import (
	"log"
	"time"

	"github.com/go-chi/jwtauth/v5"
	"github.com/go-webauthn/webauthn/webauthn"
)

var TokenAuth *jwtauth.JWTAuth
var WebAuthn *webauthn.WebAuthn

var AccessTokenTTL = 3 * time.Hour       // 3-hour expiry
var RefreshTokenTTL = 7 * 24 * time.Hour // 7-day expiry

func Init(secret, webAuthnRPDisplayName, webAuthnRPID, webAuthnRPOrigin string) {
	TokenAuth = jwtauth.New("HS256", []byte(secret), nil)

	var err error
	WebAuthn, err = webauthn.New(&webauthn.Config{
		RPDisplayName: webAuthnRPDisplayName,
		RPID:          webAuthnRPID,
		RPOrigins:     []string{webAuthnRPOrigin},
	})
	if err != nil {
		log.Fatalf("Failed to initialize WebAuthn: %v", err)
	}
}
