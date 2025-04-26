package auth

import (
	"github.com/go-webauthn/webauthn/webauthn"
)

var WebAuthn *webauthn.WebAuthn

func InitPasskeyAuth() {
	var err error
	WebAuthn, err = webauthn.New(&webauthn.Config{
		RPDisplayName: "Quizio",
		RPID:          "quizio.flockert.at",                   // production domain
		RPOrigins:     []string{"https://quizio.flockert.at"}, // origin
	})
	if err != nil {
		panic("Failed to initialize WebAuthn: " + err.Error())
	}
}
