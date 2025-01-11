package handlers

import (
	"database/sql"
	"fmt"
	"time"

	"github.com/golang-jwt/jwt"
)

type DBWrapper struct {
	DB *sql.DB
}

// Generate JWT for short-term access
func generateJWT(userID int64) (string, error) {
	claims := jwt.MapClaims{
		"userId": userID,
		"exp":    time.Now().Add(15 * time.Minute).Unix(), // 15-minute expiry
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(jwtSecret)
}

// Generate a refresh token (a random string)
func generateRefreshToken() string {
	return fmt.Sprintf("%x", time.Now().UnixNano())
}
