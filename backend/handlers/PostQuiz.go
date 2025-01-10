package handlers

import (
	"context"

	"github.com/swaggest/usecase"

	"quizio/backend/models"
)

func (dbw *DBWrapper) PostQuiz() usecase.Interactor {
	return usecase.NewInteractor(func(ctx context.Context, input models.Quiz, output *models.Quiz) error {
		_, err := dbw.DB.Exec(`
			INSERT INTO quizzes (id, title, description, is_published, play_count) 
			VALUES ($1, $2, $3, $4, $5)
		`,
			input.ID, input.Title, input.Description, input.IsPublished, input.PlayCount,
		)
		if err != nil {
			return err
		}

		*output = input
		return nil
	})
}
