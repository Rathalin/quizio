package handlers

import (
	"database/sql"
	"fmt"
	"quizio/backend/auth"
	"time"
)

type DBWrapper struct {
	DB *sql.DB
}

// GenerateJWT generates a short-term access token using jwtauth.JWTAuth
func generateJWT(userID int64) (string, error) {
	// Create claims with user ID and expiry time
	claims := map[string]interface{}{
		"userId": userID,
		"exp":    time.Now().Add(15 * time.Minute).Unix(), // 15-minute expiry
		"type":   "access",
	}

	// Encode the claims into a JWT
	_, tokenString, err := auth.TokenAuth.Encode(claims)
	if err != nil {
		return "", fmt.Errorf("failed to generate JWT: %w", err)
	}

	return tokenString, nil
}

// GenerateRefreshToken generates a secure refresh token using jwtauth.JWTAuth
func generateRefreshToken(userID int64) (string, error) {
	// Create claims with user ID and longer expiry time (e.g., 7 days)
	claims := map[string]interface{}{
		"userId": userID,
		"exp":    time.Now().Add(7 * 24 * time.Hour).Unix(), // 7-day expiry
		"type":   "refresh",                                 // To differentiate from access tokens
	}

	// Encode the claims into a JWT
	_, tokenString, err := auth.TokenAuth.Encode(claims)
	if err != nil {
		return "", fmt.Errorf("failed to generate refresh token: %w", err)
	}

	return tokenString, nil
}
