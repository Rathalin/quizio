package handlers

import (
	"context"
	"time"

	"github.com/swaggest/usecase"

	"quizio/backend/models"
)

type GetQuizzesResponse struct {
	ID            int       `json:"id" required:"true" description:"Unique identifier of the quiz."`
	CreatedAt     time.Time `json:"created_at" description:"Timestamp when the quiz was created."`
	UpdatedAt     time.Time `json:"updated_at" description:"Timestamp when the quiz was last updated."`
	UUID          string    `json:"uuid" required:"true" description:"UUID"`
	Title         string    `json:"title" required:"true" description:"Title of the quiz."`
	Description   string    `json:"description" description:"Description of the quiz."`
	IsPublished   bool      `json:"isPublished" description:"Publication status of the quiz."`
	PlayCount     int       `json:"playCount" description:"Number of times the quiz has been played."`
	QuestionCount int       `json:"questionCount" description:"Number questions of the quiz."`
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
