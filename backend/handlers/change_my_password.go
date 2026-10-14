package handlers

import (
	"context"
	"errors"
	"fmt"

	"github.com/Rathalin/quizio/backend/db/sqlc"
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
			return status.Wrap(errors.New("new password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character"), status.InvalidArgument)
		}

		// Fetch current password hash from the database
		currentPasswordHash, err := dbw.Queries.GetPasswordHashById(ctx, userId)
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

		qtx := dbw.Queries.WithTx(tx)

		err = qtx.UpdatePasswordHash(ctx, sqlc.UpdatePasswordHashParams{
			PasswordHash: string(hashedNewPassword),
			ID:           userId,
		})
		if err != nil {
			return logAndReturnError(err)
		}

		// Invalidate all existing sessions
		err = qtx.DeleteRefreshTokensByUserId(ctx, userId)
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
