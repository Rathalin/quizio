package handlers

import (
	"context"

	"github.com/swaggest/usecase"
)

func (dbw *DBWrapper) SignOut() usecase.Interactor {
	type request struct {
		RefreshToken string `json:"refreshToken" required:"true"`
	}

	type response struct{}

	return usecase.NewInteractor(func(ctx context.Context, input request, output *response) error {
		_, err := dbw.DB.Exec(`
			DELETE FROM refresh_token
			WHERE token = $1
		`, input.RefreshToken)
		if err != nil {
			return err
		}
		return nil
	})
}
