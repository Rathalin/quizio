package handlers

import (
	"context"

	"github.com/Rathalin/quizio/backend/models"
	"github.com/swaggest/usecase"
	"github.com/swaggest/usecase/status"
)

func (dbw *DBWrapper) GetMyAccount() usecase.Interactor {
	type getUserAccountRequest struct{}

	return usecase.NewInteractor(func(ctx context.Context, input getUserAccountRequest, output *models.UserAccount) error {
		userId, err := getUserIdFromContext(ctx)
		if err != nil {
			return logAndReturnError(err)
		}

		if err := validate.Struct(input); err != nil {
			return status.Wrap(logAndReturnError(err), status.InvalidArgument)
		}

		response := models.UserAccount{}

		err = dbw.DB.QueryRow(`
			SELECT uuid, created_at, updated_at, username, is_confirmed, is_blocked, profile_image_url
			FROM user_account
			WHERE id = $1
		`, userId).Scan(&response.UUID, &response.CreatedAt, &response.UpdatedAt, &response.Username, &response.IsConfirmed, &response.IsBlocked, &response.ProfileImageUrl)
		if err != nil {
			return logAndReturnError(err)
		}

		passkeysCount := 0
		err = dbw.DB.QueryRow(`
			SELECT COUNT(*)
			FROM passkey
			WHERE user_account_id = $1
		`, userId).Scan(&passkeysCount)
		if err != nil {
			return logAndReturnError(err)
		}
		response.HasPasskeys = passkeysCount > 0

		*output = response
		return nil
	})
}
