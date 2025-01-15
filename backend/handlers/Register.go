package handlers

import (
	"context"
	"errors"
	"fmt"
	"regexp"
	"strings"

	"github.com/swaggest/usecase"
	"github.com/swaggest/usecase/status"
	"golang.org/x/crypto/bcrypt"
)

func (dbw *DBWrapper) Register() usecase.Interactor {
	type registerRequest struct {
		Username string `json:"username" required:"true"`
		Password string `json:"password" required:"true"`
	}

	type registerResponse struct {
		Message string `json:"message"`
	}

	return usecase.NewInteractor(func(ctx context.Context, input registerRequest, output *registerResponse) error {
		// Validate username and password
		if len(input.Username) < 3 {
			return errors.New("username must be at least 3 characters long")
		}
		if len(input.Password) < 8 {
			return errors.New("password must be at least 8 characters long")
		}
		if !isValidPassword(input.Password) {
			return errors.New("password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character")
		}

		// Hash the password
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
		if err != nil {
			return errors.New("failed to hash password")
		}

		trimmedUsername := strings.TrimSpace(input.Username)

		// Check if username is taken
		isNew, err := dbw.isNewUsername(trimmedUsername)
		if err != nil {
			return err
		}

		if !isNew {
			return status.Wrap(errors.New("username already exists"), status.AlreadyExists)
		}

		// Insert user into the database
		_, err = dbw.DB.Exec(`
			INSERT INTO user_account (username, password_hash, is_confirmed, is_blocked)
			VALUES ($1, $2, true, false)
		`, trimmedUsername, string(hashedPassword))
		if err != nil {
			return err
		}

		fmt.Printf("New user: %v - %v", trimmedUsername, input.Password)
		*output = registerResponse{Message: "Registration successful"}
		return nil
	})
}

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
