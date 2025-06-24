package auth

import (
	"github.com/go-webauthn/webauthn/webauthn"
)

var WebAuthn *webauthn.WebAuthn

func InitPasskeyAuth() {
	var err error
	WebAuthn, err = webauthn.New(&webauthn.Config{
		RPDisplayName: "Quizio",
		RPID:          "localhost",                  // production domain
		RPOrigins:     []string{"http://localhost"}, // origin
	})
	if err != nil {
		panic("Failed to initialize WebAuthn: " + err.Error())
	}
}
