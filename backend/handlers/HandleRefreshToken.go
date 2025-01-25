package handlers

import (
	"context"
	"errors"
	"quizio/backend/models"

	"github.com/swaggest/usecase"
)

func (dbw *DBWrapper) HandleRefreshToken() usecase.Interactor {
	type refreshTokenRequest struct {
		RefreshToken string `json:"refreshToken" required:"true"`
	}

	type refreshTokenResponse struct {
		AccessToken string             `json:"accessToken" required:"true"`
		User        models.UserAccount `json:"user" required:"true"`
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

		response := refreshTokenResponse{}

		// Fetch user details
		err = dbw.DB.QueryRow(`
			SELECT uuid, created_at, updated_at, username, is_confirmed, is_blocked, profile_image_url
			FROM user_account
			WHERE id = $1
		`, userID).Scan(
			&response.User.UUID,
			&response.User.CreatedAt,
			&response.User.UpdatedAt,
			&response.User.Username,
			&response.User.IsConfirmed,
			&response.User.IsBlocked,
			&response.User.ProfileImageUrl,
		)
		if err != nil {
			return logAndReturnError(err)
		}

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
