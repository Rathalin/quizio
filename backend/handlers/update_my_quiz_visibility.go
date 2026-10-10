package handlers

import (
	"context"

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

		var quizId int64
		err = dbw.DB.QueryRowContext(ctx, `
			UPDATE quiz
			SET is_published = $1
			WHERE uuid = $2 AND user_account_id = $3
			RETURNING id
		`, input.IsPublished, input.UUID, userId).Scan(&quizId)
		if err != nil {
			return logAndReturnError(err)
		}

		*output = updateQuizVisibilityResponse{}
		return nil
	})
}
