package handlers

import (
	"context"
	"fmt"

	"github.com/swaggest/usecase"
	"github.com/swaggest/usecase/status"
)

func (dbw *DBWrapper) UpdateQuizVisibility() usecase.Interactor {
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
			return status.Wrap(logAndReturnErrorMessage("quiz does not exists (invalid uuid)"), status.NotFound)
		}

		if err := validate.Struct(input); err != nil {
			return status.Wrap(logAndReturnError(err), status.InvalidArgument)
		}

		quizExists, err := dbw.QuizExistsForUser(input.UUID, userId)
		if err != nil {
			return logAndReturnError(err)
		}
		if !quizExists {
			return status.Wrap(logAndReturnErrorMessage(fmt.Sprintf("quiz with uuid %v does not exist for this user", input.UUID)), status.NotFound)
		}

		tx, err := dbw.DB.BeginTx(ctx, nil)
		if err != nil {
			return logAndReturnError(err)
		}

		defer tx.Rollback()

		// Update visibility
		_, err = tx.ExecContext(ctx, `
			UPDATE quiz
			SET is_published = $1
			WHERE uuid = $2
		`, input.IsPublished, input.UUID)
		if err != nil {
			return logAndReturnError(err)
		}

		if err := tx.Commit(); err != nil {
			return logAndReturnError(err)
		}

		*output = updateQuizVisibilityResponse{}
		return nil
	})
}
