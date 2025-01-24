package handlers

import (
	"context"
	"errors"

	"github.com/swaggest/usecase"
)

func (dbw *DBWrapper) RefreshToken() usecase.Interactor {
	type refreshTokenRequest struct {
		RefreshToken string `json:"refreshToken" required:"true"`
	}

	type refreshTokenResponse struct {
		AccessToken string `json:"accessToken" required:"true"`
	}

	return usecase.NewInteractor(func(ctx context.Context, input refreshTokenRequest, output *refreshTokenResponse) error {
		var userID int64

		// Validate refresh token
		err := dbw.DB.QueryRow(`
			SELECT user_account_id
			FROM refresh_token
			WHERE token = $1 AND expires_at > NOW()
		`, input.RefreshToken).Scan(&userID)
		if err != nil {
			return errors.New("invalid or expired refresh token")
		}

		// Generate new access token
		accessToken, err := generateJWT(userID)
		if err != nil {
			return logAndReturnError(err.Error())
		}

		*output = refreshTokenResponse{AccessToken: accessToken}
		return nil
	})
}
