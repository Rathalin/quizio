package handlers

import (
	"context"
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
		if err := validate.Struct(input); err != nil {
			return status.Wrap(logAndReturnError(err), status.InvalidArgument)
		}

		// Validate username and password
		trimmedUsername := strings.TrimSpace(input.Username)
		if len(trimmedUsername) < 3 {
			return logAndReturnErrorMessage("username must be at least 3 characters long")
		}
		if len(trimmedUsername) > 50 {
			return logAndReturnErrorMessage("username cannot be longer than 50 characters")
		}
		if len(input.Password) < 8 {
			return logAndReturnErrorMessage("password must be at least 8 characters long")
		}
		if len(input.Password) > 72 {
			return logAndReturnErrorMessage("password cannot be longer than 72 characters")
		}
		if !isValidPassword(input.Password) {
			return logAndReturnErrorMessage("password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character")
		}

		// Check if username is taken before expensive hashing
		usernameExists, err := dbw.UsernameExists(ctx, trimmedUsername)
		if err != nil {
			return logAndReturnError(err)
		}

		if usernameExists {
			return status.Wrap(logAndReturnErrorMessage("username already exists"), status.AlreadyExists)
		}

		// Hash the password
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
		if err != nil {
			return logAndReturnError(err)
		}

		// Insert user into the database
		_, err = dbw.DB.ExecContext(ctx, `
			INSERT INTO user_account (username, password_hash, is_confirmed, is_blocked)
			VALUES ($1, $2, true, false)
		`, trimmedUsername, string(hashedPassword))
		if err != nil {
			return logAndReturnError(err)
		}

		*output = registerResponse{Message: "Registration successful"}
		return nil
	})
}
