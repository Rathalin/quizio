package handlers

import (
	"context"
	"quizio/backend/models"
	"time"

	"github.com/swaggest/usecase"
	"github.com/swaggest/usecase/status"
)

func (dbw *DBWrapper) GetQuizByUuid() usecase.Interactor {
	type request struct {
		UUID string `path:"uuid"`
	}

	type response struct {
		Title     string            `json:"title" required:"true"`
		Questions []models.Question `json:"questions" required:"true" nullable:"false"`
	}

	type row struct {
		ID       string
		Title    string
		Question struct {
			ID                  string
			Title               string
			Description         *string
			ImageUrl            *string
			Explanation         *string
			ExplanationImageUrl *string
			CreatedAt           time.Time
			UpdatedAt           time.Time
		}
		Answer struct {
			ID          string
			Title       string
			Description *string
			ImageUrl    *string
			IsCorrect   bool
			CreatedAt   time.Time
			UpdatedAt   time.Time
		}
	}

	return usecase.NewInteractor(func(_ context.Context, input request, output *response) error {
		count := 0
		err := dbw.DB.QueryRow(`
			SELECT COUNT(*)
			FROM quiz
			WHERE uuid = $1
		`, input.UUID).Scan(&count)
		if err != nil {
			return err
		}
		if count == 0 {
			return status.NotFound
		}

		rows, err := dbw.DB.Query(`
			SELECT
				q.id,
				q.title,
				qn.id,
				qn.created_at,
				qn.updated_at,
				qn.title,
				qn.description_text,
				qn.image_url,
				qn.explanation,
				qn.explanation_image_url,
				a.id,
				a.created_at,
				a.updated_at,
				a.title,
				a.description_text,
				a.image_url,
				a.is_correct
			FROM quiz q
			JOIN question qn
				ON q.id = qn.quiz_id
			JOIN answer a
				ON qn.id = a.question_id
			WHERE q.uuid = $1
		`, input.UUID)
		if err != nil {
			return err
		}
		defer rows.Close()

		var row row
		var response response
		lastQuizId := ""
		lastQuestionId := ""

		for rows.Next() {
			if err := rows.Scan(
				&row.ID,
				&row.Title,
				&row.Question.ID,
				&row.Question.CreatedAt,
				&row.Question.UpdatedAt,
				&row.Question.Title,
				&row.Question.Description,
				&row.Question.ImageUrl,
				&row.Question.Explanation,
				&row.Question.ExplanationImageUrl,
				&row.Answer.ID,
				&row.Answer.CreatedAt,
				&row.Answer.UpdatedAt,
				&row.Answer.Title,
				&row.Answer.Description,
				&row.Answer.ImageUrl,
				&row.Answer.IsCorrect,
			); err != nil {
				return err
			}

			if lastQuizId != row.ID {
				lastQuizId = row.ID
				response.Title = row.Title
			}

			if lastQuestionId != row.Question.ID {
				lastQuestionId = row.Question.ID
				response.Questions = append(response.Questions, models.Question{
					CreatedAt:           row.Question.CreatedAt,
					UpdatedAt:           row.Question.UpdatedAt,
					Title:               row.Question.Title,
					Description:         row.Question.Description,
					ImageUrl:            row.Question.ImageUrl,
					Explanation:         row.Question.Explanation,
					ExplanationImageUrl: row.Question.ExplanationImageUrl,
				})
			}

			response.Questions[len(response.Questions)-1].Answers = append(response.Questions[len(response.Questions)-1].Answers, models.Answer{
				CreatedAt:   row.Answer.CreatedAt,
				UpdatedAt:   row.Question.UpdatedAt,
				Title:       row.Answer.Title,
				Description: row.Answer.Description,
				ImageUrl:    row.Answer.ImageUrl,
				IsCorrect:   row.Answer.IsCorrect,
			})
		}
		*output = response
		return nil
	})
}
