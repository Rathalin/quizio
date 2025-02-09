package auth

import (
	"time"

	"github.com/go-chi/jwtauth/v5"
)

var TokenAuth *jwtauth.JWTAuth

var AccessTokenTTL = time.Now().Add(24 * time.Hour).Unix()      // 24 hour expiry
var RefreshTokenTTL = time.Now().Add(7 * 24 * time.Hour).Unix() // 7-day expiry

func InitTokenAuth(secret string) {
	TokenAuth = jwtauth.New("HS256", []byte(secret), nil)
}
