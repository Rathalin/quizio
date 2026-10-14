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

		// Validate refresh token and check if the user is blocked or unconfirmed
		userID, err := dbw.Queries.GetUserIdByRefreshToken(ctx, input.RefreshToken)
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
