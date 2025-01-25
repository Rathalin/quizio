package handlers

import (
	"context"
	"errors"
	"fmt"

	"github.com/swaggest/usecase"
	"github.com/swaggest/usecase/status"
	"golang.org/x/crypto/bcrypt"
)

func (dbw *DBWrapper) ChangePassword() usecase.Interactor {
	type changePasswordRequest struct {
		CurrentPassword string `json:"currentPassword" required:"true"`
		NewPassword     string `json:"newPassword" required:"true"`
	}

	type changePasswordResponse struct {
		Message string `json:"message"`
	}

	return usecase.NewInteractor(func(ctx context.Context, input changePasswordRequest, output *changePasswordResponse) error {
		userId, err := getUserIdFromContext(ctx)
		if err != nil {
			return logAndReturnError(err)
		}

		if len(input.NewPassword) < 8 {
			return errors.New("new password must be at least 8 characters long")
		}
		if !isValidPassword(input.NewPassword) {
			return errors.New("new password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character")
		}

		// Fetch current password hash from the database
		var currentPasswordHash string
		err = dbw.DB.QueryRowContext(ctx, `
			SELECT password_hash
			FROM user_account
			WHERE id = $1
		`, userId).Scan(&currentPasswordHash)
		if err != nil {
			return status.Wrap(logAndReturnErrorMessage("username not found"), status.NotFound)
		}

		// Verify current password
		err = bcrypt.CompareHashAndPassword([]byte(currentPasswordHash), []byte(input.CurrentPassword))
		if err != nil {
			return status.Wrap(logAndReturnErrorMessage("current password is incorrect"), status.FailedPrecondition)
		}

		// Hash the new password
		hashedNewPassword, err := bcrypt.GenerateFromPassword([]byte(input.NewPassword), bcrypt.DefaultCost)
		if err != nil {
			return logAndReturnError(err)
		}

		// Update the password in the database
		_, err = dbw.DB.ExecContext(ctx, `
			UPDATE user_account
			SET password_hash = $1
			WHERE id = $2
		`, string(hashedNewPassword), userId)
		if err != nil {
			return logAndReturnError(err)
		}

		fmt.Printf("Password updated for user with id %v\n", userId)
		*output = changePasswordResponse{Message: "Password updated successfully"}
		return nil
	})
}
