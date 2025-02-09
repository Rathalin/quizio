package handlers

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"github.com/Rathalin/quizio/backend/auth"

	jwtauth "github.com/go-chi/jwtauth/v5"
)

type DBWrapper struct {
	DB *sql.DB
}

// GenerateJWT generates a short-term access token using jwtauth.JWTAuth
func generateJWT(userID int64) (string, error) {
	// Create claims with user ID and expiry time
	claims := map[string]interface{}{
		"userId": userID,
		"exp":    time.Now().Add(auth.AccessTokenTTL).Unix(),
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
		"exp":    time.Now().Add(auth.RefreshTokenTTL).Unix(),
		"type":   "refresh", // To differentiate from access tokens
	}

	// Encode the claims into a JWT
	_, tokenString, err := auth.TokenAuth.Encode(claims)
	if err != nil {
		return "", fmt.Errorf("failed to generate refresh token: %w", err)
	}

	return tokenString, nil
}

func getUserIdFromContext(ctx context.Context) (int64, error) {
	_, claims, err := jwtauth.FromContext(ctx)
	if err != nil {
		return -1, err
	}

	userId, ok := claims["userId"].(float64) // JWT claims use int64 for numbers
	if !ok {
		return -1, fmt.Errorf("userId not found in token claims")
	}

	// Print all key-value pairs in the claims map
	// fmt.Println("JWT Claims:")
	// for key, value := range claims {
	// 	fmt.Printf("%s: %v\n", key, value)
	// }

	return int64(userId), nil
}
