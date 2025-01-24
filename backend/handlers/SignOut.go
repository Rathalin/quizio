package handlers

import (
	"context"

	"github.com/swaggest/usecase"
)

func (dbw *DBWrapper) SignOut() usecase.Interactor {
	type signOutRequest struct {
		RefreshToken string `json:"refreshToken" required:"true"`
	}

	type signOutResponse struct{}

	return usecase.NewInteractor(func(ctx context.Context, input signOutRequest, output *signOutResponse) error {
		_, err := dbw.DB.Exec(`
			DELETE FROM refresh_token
			WHERE token = $1
		`, input.RefreshToken)
		if err != nil {
			return logAndReturnError(err.Error())
		}
		return nil
	})
}
