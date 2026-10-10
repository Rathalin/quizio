package handlers

import (
	"context"
	"errors"
	"fmt"

	"github.com/swaggest/usecase"
	"github.com/swaggest/usecase/status"
	"golang.org/x/crypto/bcrypt"
)

func (dbw *DBWrapper) ChangeMyPassword() usecase.Interactor {
	type changePasswordRequest struct {
		CurrentPassword string `json:"currentPassword" required:"true" validate:"required"`
		NewPassword     string `json:"newPassword" required:"true" validate:"required,min=6,max=50"`
	}

	type changePasswordResponse struct {
		Message string `json:"message"`
	}

	return usecase.NewInteractor(func(ctx context.Context, input changePasswordRequest, output *changePasswordResponse) error {
		userId, err := getUserIdFromContext(ctx)
		if err != nil {
			return logAndReturnError(err)
		}

		if err := validate.Struct(input); err != nil {
			return status.Wrap(logAndReturnError(err), status.InvalidArgument)
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

		// Update the password and clear refresh tokens in a transaction
		tx, err := dbw.DB.BeginTx(ctx, nil)
		if err != nil {
			return logAndReturnError(err)
		}
		defer tx.Rollback()

		_, err = tx.ExecContext(ctx, `
			UPDATE user_account
			SET password_hash = $1
			WHERE id = $2
		`, string(hashedNewPassword), userId)
		if err != nil {
			return logAndReturnError(err)
		}

		// Invalidate all existing sessions
		_, err = tx.ExecContext(ctx, `
			DELETE FROM refresh_token
			WHERE user_account_id = $1
		`, userId)
		if err != nil {
			return logAndReturnError(err)
		}

		if err = tx.Commit(); err != nil {
			return logAndReturnError(err)
		}

		fmt.Printf("Password updated for user with id %v\n", userId)
		*output = changePasswordResponse{Message: "Password updated successfully"}
		return nil
	})
}
