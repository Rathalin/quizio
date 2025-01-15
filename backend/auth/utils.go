package auth

import "github.com/go-chi/jwtauth/v5"

var TokenAuth *jwtauth.JWTAuth = jwtauth.New("HS256", []byte("your-secret-key"), nil)
