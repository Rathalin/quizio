package handlers

import (
	"context"
	"database/sql"
	"errors"
	"strings"
	"time"

	"github.com/Rathalin/quizio/backend/auth"
	"github.com/Rathalin/quizio/backend/db/sqlc"
	"github.com/swaggest/usecase"
	"github.com/swaggest/usecase/status"
	"golang.org/x/crypto/bcrypt"
)

func (dbw *DBWrapper) SignIn() usecase.Interactor {
	type signInRequest struct {
		Username string `json:"username" required:"true"`
		Password string `json:"password" required:"true"`
	}

	type signInResponse struct {
		UserUUID     string `json:"uuid" required:"true"`
		AccessToken  string `json:"accessToken" required:"true"`
		RefreshToken string `json:"refreshToken" required:"true"`
	}

	u := usecase.NewInteractor(func(ctx context.Context, input signInRequest, output *signInResponse) error {
		if err := validate.Struct(input); err != nil {
			return status.Wrap(logAndReturnError(err), status.InvalidArgument)
		}

		trimmedUsername := strings.TrimSpace(input.Username)
		unauthenticatedMessage := "invalid username or password"

		// Fetch user details
		user, err := dbw.Queries.GetUserSignInData(ctx, trimmedUsername)
		if err != nil {
			if errors.Is(err, sql.ErrNoRows) {
				return status.Wrap(logAndReturnTypedError(unauthenticatedMessage, "invalid_credentials"), status.Unauthenticated)
			}
			return logAndReturnError(err)
		}

		if !user.IsConfirmed {
			return status.Wrap(logAndReturnTypedError("account is not confirmed", "account_unconfirmed"), status.PermissionDenied)
		}

		if user.IsBlocked {
			return status.Wrap(logAndReturnTypedError("account is blocked", "account_blocked"), status.PermissionDenied)
		}

		// Validate password
		err = bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(input.Password))
		if err != nil {
			return status.Wrap(logAndReturnTypedError(unauthenticatedMessage, "invalid_credentials"), status.Unauthenticated)
		}

		// Generate access token
		accessToken, err := generateJWT(user.ID)
		if err != nil {
			return logAndReturnError(err)
		}

		// Generate refresh token
		refreshToken, err := generateRefreshToken(user.ID)
		if err != nil {
			return logAndReturnError(err)
		}

		err = dbw.Queries.CreateRefreshToken(ctx, sqlc.CreateRefreshTokenParams{
			UserAccountID: user.ID,
			Token:         refreshToken,
			ExpiresAt:     time.Now().Add(auth.RefreshTokenTTL),
		})
		if err != nil {
			return logAndReturnError(err)
		}

		*output = signInResponse{
			UserUUID:     user.Uuid.String(),
			AccessToken:  accessToken,
			RefreshToken: refreshToken,
		}
		return nil
	})

	u.SetExpectedErrors(
		status.Wrap(&TypedError{ErrorType: "invalid_credentials"}, status.Unauthenticated),
		status.Wrap(&TypedError{ErrorType: "account_blocked"}, status.PermissionDenied),
		status.Wrap(&TypedError{ErrorType: "account_unconfirmed"}, status.PermissionDenied),
	)

	return u
}
