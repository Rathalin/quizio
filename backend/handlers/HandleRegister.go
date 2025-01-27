package handlers

import (
	"context"
	"fmt"
	"strings"

	"github.com/swaggest/usecase"
	"github.com/swaggest/usecase/status"
	"golang.org/x/crypto/bcrypt"
)

func (dbw *DBWrapper) HandleRegister() usecase.Interactor {
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
			return logAndReturnErrorMessage("username must be at least 3 characters long")
		}
		if len(input.Password) < 8 {
			return logAndReturnErrorMessage("password must be at least 8 characters long")
		}
		if !isValidPassword(input.Password) {
			return logAndReturnErrorMessage("password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character")
		}

		// Hash the password
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
		if err != nil {
			return logAndReturnError(err)
		}

		trimmedUsername := strings.TrimSpace(input.Username)

		// Check if username is taken
		usernameExists, err := dbw.UsernameExists(trimmedUsername)
		if err != nil {
			return logAndReturnError(err)
		}

		if usernameExists {
			return status.Wrap(logAndReturnErrorMessage("username already exists"), status.AlreadyExists)
		}

		// Insert user into the database
		_, err = dbw.DB.Exec(`
			INSERT INTO user_account (username, password_hash, is_confirmed, is_blocked)
			VALUES ($1, $2, true, false)
		`, trimmedUsername, string(hashedPassword))
		if err != nil {
			return logAndReturnError(err)
		}

		fmt.Printf("New user: %v - %v", trimmedUsername, input.Password)
		*output = registerResponse{Message: "Registration successful"}
		return nil
	})
}
