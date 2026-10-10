package handlers

import (
	"context"
	"errors"

	"github.com/swaggest/usecase"
	"github.com/swaggest/usecase/status"
)

func (dbw *DBWrapper) RefreshToken() usecase.Interactor {
	type refreshTokenRequest struct {
		RefreshToken string `json:"refreshToken" required:"true"`
	}

	type refreshTokenResponse struct {
		AccessToken string `json:"accessToken" required:"true"`
	}

	return usecase.NewInteractor(func(ctx context.Context, input refreshTokenRequest, output *refreshTokenResponse) error {
		if err := validate.Struct(input); err != nil {
			return status.Wrap(logAndReturnError(err), status.InvalidArgument)
		}

		var userID int64

		// Validate refresh token and check if the user is blocked or unconfirmed
		err := dbw.DB.QueryRow(`
			SELECT rt.user_account_id
			FROM refresh_token rt
			JOIN user_account ua ON rt.user_account_id = ua.id
			WHERE rt.token = $1 AND rt.expires_at > NOW() AND ua.is_blocked = false AND ua.is_confirmed = true
		`, input.RefreshToken).Scan(&userID)
		if err != nil {
			return status.Wrap(errors.New("invalid or expired refresh token, or account blocked/unconfirmed"), status.Unauthenticated)
		}

		response := refreshTokenResponse{}

		// Generate new access token
		accessToken, err := generateJWT(userID)
		if err != nil {
			return logAndReturnError(err)
		}
		response.AccessToken = accessToken

		*output = response
		return nil
	})
}
