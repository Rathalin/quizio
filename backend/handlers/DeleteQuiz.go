package handlers

import (
	"context"
	"errors"

	"github.com/swaggest/usecase"
	"github.com/swaggest/usecase/status"
)

func (dbw *DBWrapper) DeleteQuiz() usecase.Interactor {
	type deleteQuizRequest struct {
		UUID string `path:"uuid" required:"true"`
	}

	type deleteQuizResponse struct{}

	return usecase.NewInteractor(func(ctx context.Context, input deleteQuizRequest, output *deleteQuizResponse) error {
		quizExists, err := dbw.QuizExists(input.UUID)
		if err != nil {
			return err
		}
		if !quizExists {
			return status.Wrap(errors.New("quiz does not exist"), status.NotFound)
		}

		_, err = dbw.DB.ExecContext(ctx, `
			DELETE FROM quiz
			WHERE uuid = $1
		`, input.UUID)
		if err != nil {
			return err
		}

		*output = deleteQuizResponse{}
		return nil
	})
}
