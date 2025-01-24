package handlers

import (
	"context"
	"fmt"

	"github.com/swaggest/usecase"
	"github.com/swaggest/usecase/status"
)

func (dbw *DBWrapper) DeleteQuiz() usecase.Interactor {
	type deleteQuizRequest struct {
		UUID string `path:"uuid" required:"true"`
	}

	type deleteQuizResponse struct{}

	return usecase.NewInteractor(func(ctx context.Context, input deleteQuizRequest, output *deleteQuizResponse) error {
		userId, err := getUserIdFromContext(ctx)
		if err != nil {
			return logAndReturnError(err.Error())
		}

		quizExists, err := dbw.QuizExistsForUser(input.UUID, userId)
		if err != nil {
			return logAndReturnError(err.Error())
		}
		if !quizExists {
			return status.Wrap(logAndReturnError(fmt.Sprintf("quiz with uuid %v does not exist for this user", input.UUID)), status.NotFound)
		}

		_, err = dbw.DB.ExecContext(ctx, `
			DELETE FROM quiz
			WHERE uuid = $1
		`, input.UUID)
		if err != nil {
			return logAndReturnError(err.Error())
		}

		*output = deleteQuizResponse{}
		return nil
	})
}
