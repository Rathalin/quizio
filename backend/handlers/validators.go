package handlers

import (
	"regexp"

	"github.com/google/uuid"
)

// Helper function to validate password complexity
func isValidPassword(password string) bool {
	// Check for minimum length
	if len(password) < 8 {
		return false
	}

	// Check for at least one lowercase letter
	hasLower := regexp.MustCompile(`[a-z]`).MatchString(password)
	// Check for at least one uppercase letter
	hasUpper := regexp.MustCompile(`[A-Z]`).MatchString(password)
	// Check for at least one digit
	hasDigit := regexp.MustCompile(`\d`).MatchString(password)
	// Check for at least one special character
	hasSpecial := regexp.MustCompile(`[!@#$%^&*(),.?":{}|<>]`).MatchString(password)

	return hasLower && hasUpper && hasDigit && hasSpecial
}

func isValidUUID(u string) bool {
	_, err := uuid.Parse(u)
	return err == nil
}
