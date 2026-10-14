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

		acc, err := dbw.Queries.GetMyAccount(ctx, userId)
		if err != nil {
			return logAndReturnError(err)
		}

		*output = models.UserAccount{
			UUID:            acc.Uuid.String(),
			CreatedAt:       acc.CreatedAt,
			UpdatedAt:       acc.UpdatedAt,
			Username:        acc.Username,
			IsConfirmed:     acc.IsConfirmed,
			IsBlocked:       acc.IsBlocked,
			ProfileImageUrl: acc.ProfileImageUrl,
		}
		return nil
	})
}
