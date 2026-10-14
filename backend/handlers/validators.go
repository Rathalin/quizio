package handlers

import (
	"regexp"

	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
)

var (
	validate = validator.New(validator.WithRequiredStructEnabled())

	hasLowerRegex   = regexp.MustCompile(`[a-z]`)
	hasUpperRegex   = regexp.MustCompile(`[A-Z]`)
	hasDigitRegex   = regexp.MustCompile(`\d`)
	hasSpecialRegex = regexp.MustCompile(`[!@#$%^&*(),.?":{}|<>_\-\s]`)
)

// Helper function to validate password complexity
func isValidPassword(password string) bool {
	// Check for length bounds (bcrypt truncates/fails beyond 72 bytes)
	if len(password) < 8 || len(password) > 72 {
		return false
	}

	return hasLowerRegex.MatchString(password) &&
		hasUpperRegex.MatchString(password) &&
		hasDigitRegex.MatchString(password) &&
		hasSpecialRegex.MatchString(password)
}

func isValidUUID(u string) bool {
	_, err := uuid.Parse(u)
	return err == nil
}
