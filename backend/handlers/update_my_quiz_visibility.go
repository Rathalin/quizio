package handlers

import (
	"context"

	"github.com/Rathalin/quizio/backend/db/sqlc"
	"github.com/google/uuid"
	"github.com/swaggest/usecase"
	"github.com/swaggest/usecase/status"
)

func (dbw *DBWrapper) UpdateMyQuizVisibility() usecase.Interactor {
	type updateQuizVisibilityRequest struct {
		UUID        string `path:"uuid" required:"true"`
		IsPublished bool   `json:"isPublished" required:"true"`
	}

	type updateQuizVisibilityResponse struct{}

	return usecase.NewInteractor(func(ctx context.Context, input updateQuizVisibilityRequest, output *updateQuizVisibilityResponse) error {
		userId, err := getUserIdFromContext(ctx)
		if err != nil {
			return logAndReturnError(err)
		}

		if !isValidUUID(input.UUID) {
			return status.Wrap(logAndReturnErrorMessage("quiz does not exist (invalid uuid)"), status.NotFound)
		}

		if err := validate.Struct(input); err != nil {
			return status.Wrap(logAndReturnError(err), status.InvalidArgument)
		}

		quizUUID, err := uuid.Parse(input.UUID)
		if err != nil {
			return status.Wrap(logAndReturnErrorMessage("quiz does not exist (invalid uuid)"), status.NotFound)
		}

		_, err = dbw.Queries.UpdateQuizVisibility(ctx, sqlc.UpdateQuizVisibilityParams{
			IsPublished:   input.IsPublished,
			Uuid:          quizUUID,
			UserAccountID: userId,
		})
		if err != nil {
			return logAndReturnError(err)
		}

		*output = updateQuizVisibilityResponse{}
		return nil
	})
}
