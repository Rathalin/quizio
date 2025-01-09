package handlers

import (
	"context"
	"database/sql"

	"github.com/swaggest/usecase"

	"quizio/backend/models"
)

type DBWrapper struct {
	DB *sql.DB
}

func (dbw *DBWrapper) GetQuizzes() usecase.Interactor {
	return usecase.NewInteractor(func(_ context.Context, _ struct{}, output *[]models.Quiz) error {
		rows, err := dbw.DB.Query(`
			SELECT id, uuid, title, description, is_published, play_count 
			FROM quizzes
		`)
		if err != nil {
			return err
		}
		defer rows.Close()

		var quizzes []models.Quiz
		for rows.Next() {
			var quiz models.Quiz
			if err := rows.Scan(&quiz.ID, &quiz.UUID, &quiz.Title, &quiz.Description, &quiz.IsPublished, &quiz.PlayCount); err != nil {
				return err
			}
			quizzes = append(quizzes, quiz)
		}
		*output = quizzes
		return nil
	})
}

func (dbw *DBWrapper) GetQuizzesUuids() usecase.Interactor {
	return usecase.NewInteractor(func(_ context.Context, _ struct{}, output *[]string) error {
		rows, err := dbw.DB.Query(`
			SELECT uuid
			FROM quizzes
		`)
		if err != nil {
			return err
		}
		defer rows.Close()

		var uuids []string
		for rows.Next() {
			var uuid string
			if err := rows.Scan(&uuid); err != nil {
				return err
			}
			uuids = append(uuids, uuid)
		}
		*output = uuids
		return nil
	})
}

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
