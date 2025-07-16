package auth

import (
	"time"

	"github.com/go-chi/jwtauth/v5"
)

var TokenAuth *jwtauth.JWTAuth

var AccessTokenTTL = 15 * time.Minute    // 15 minutes expiry
var RefreshTokenTTL = 7 * 24 * time.Hour // 7-day expiry

func Init(secret string) {
	TokenAuth = jwtauth.New("HS256", []byte(secret), nil)
}
