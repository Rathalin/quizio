package auth

import (
	"github.com/go-chi/jwtauth/v5"
)

var TokenAuth *jwtauth.JWTAuth

func InitTokenAuth(secret string) {
	TokenAuth = jwtauth.New("HS256", []byte(secret), nil)
}
