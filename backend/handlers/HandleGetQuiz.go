package handlers

import (
	"context"
	"fmt"
	"quizio/backend/models"
	"time"

	"github.com/swaggest/usecase"
	"github.com/swaggest/usecase/status"
)

func (dbw *DBWrapper) HandleGetQuiz() usecase.Interactor {
	type getQuizRequest struct {
		UUID string `path:"uuid" required:"true" example:"c1508211-6aab-4090-8727-94de0d40c808"`
	}

	type getQuizResponse struct {
		Title       string            `json:"title" required:"true"`
		Description string            `json:"description" required:"true"`
		IsPublished bool              `json:"isPublished" required:"true"`
		ImageUrl    *string           `json:"imageUrl" required:"true" nullable:"true"`
		Questions   []models.Question `json:"questions" required:"true" nullable:"false"`
	}

	type row struct {
		ID          string
		Title       string
		Description string
		IsPublished bool
		ImageUrl    *string
		Question    struct {
			ID                  string
			UUID                string
			CreatedAt           time.Time
			UpdatedAt           time.Time
			OrderIndex          int
			Title               string
			Description         *string
			ImageUrl            *string
			Explanation         *string
			ExplanationImageUrl *string
		}
		Answer struct {
			ID          string
			UUID        string
			CreatedAt   time.Time
			UpdatedAt   time.Time
			OrderIndex  int
			Title       string
			Description *string
			ImageUrl    *string
			IsCorrect   bool
		}
	}

	return usecase.NewInteractor(func(ctx context.Context, input getQuizRequest, output *getQuizResponse) error {
		userId, err := getUserIdFromContext(ctx)
		if err != nil {
			return logAndReturnError(err)
		}

		quizExists, err := dbw.QuizExistsForUser(input.UUID, userId)
		if err != nil {
			return logAndReturnError(err)
		}
		if !quizExists {
			return status.Wrap(logAndReturnErrorMessage(fmt.Sprintf("quiz wtih uuid %v does not exists for this user", input.UUID)), status.NotFound)
		}

		rows, err := dbw.DB.Query(`
			SELECT
				q.id,
				q.title,
				q.description_text,
				q.is_published,
				q.image_url,
				qn.id,
				qn.uuid,
				qn.created_at,
				qn.updated_at,
				qn.order_index,
				qn.title,
				qn.description_text,
				qn.image_url,
				qn.explanation,
				qn.explanation_image_url,
				a.id,
				a.uuid,
				a.created_at,
				a.updated_at,
				a.order_index,
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
			ORDER BY qn.order_index ASC, a.order_index ASC
		`, input.UUID)
		if err != nil {
			return logAndReturnError(err)
		}
		defer rows.Close()

		var row row
		response := getQuizResponse{
			Questions: make([]models.Question, 0),
		}
		lastQuizId := ""
		lastQuestionId := ""

		for rows.Next() {
			if err := rows.Scan(
				&row.ID,
				&row.Title,
				&row.Description,
				&row.IsPublished,
				&row.ImageUrl,
				&row.Question.ID,
				&row.Question.UUID,
				&row.Question.CreatedAt,
				&row.Question.UpdatedAt,
				&row.Question.OrderIndex,
				&row.Question.Title,
				&row.Question.Description,
				&row.Question.ImageUrl,
				&row.Question.Explanation,
				&row.Question.ExplanationImageUrl,
				&row.Answer.ID,
				&row.Answer.UUID,
				&row.Answer.CreatedAt,
				&row.Answer.UpdatedAt,
				&row.Answer.OrderIndex,
				&row.Answer.Title,
				&row.Answer.Description,
				&row.Answer.ImageUrl,
				&row.Answer.IsCorrect,
			); err != nil {
				return logAndReturnError(err)
			}

			if lastQuizId != row.ID {
				lastQuizId = row.ID
				response.Title = row.Title
				response.Description = row.Description
				response.IsPublished = row.IsPublished
				response.ImageUrl = row.ImageUrl
			}

			if lastQuestionId != row.Question.ID {
				lastQuestionId = row.Question.ID
				response.Questions = append(response.Questions, models.Question{
					UUID:                row.Question.UUID,
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
				UUID:        row.Answer.UUID,
				CreatedAt:   row.Answer.CreatedAt,
				UpdatedAt:   row.Answer.UpdatedAt,
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
