package handlers

import (
	"context"
	"errors"

	"github.com/swaggest/usecase"
)

func (dbw *DBWrapper) RefreshToken() usecase.Interactor {
	type request struct {
		RefreshToken string `json:"refreshToken" required:"true"`
	}

	type response struct {
		AccessToken string `json:"accessToken"`
	}
	return usecase.NewInteractor(func(ctx context.Context, input request, output *response) error {
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
			return err
		}

		*output = response{AccessToken: accessToken}
		return nil
	})
}
