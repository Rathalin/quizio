package handlers

import (
	"context"
	"fmt"

	"github.com/Rathalin/quizio/backend/db/sqlc"
	"github.com/Rathalin/quizio/backend/models"
	"github.com/google/uuid"

	"github.com/swaggest/usecase"
	"github.com/swaggest/usecase/status"
)

func (dbw *DBWrapper) GetMyQuiz() usecase.Interactor {
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

	return usecase.NewInteractor(func(ctx context.Context, input getQuizRequest, output *getQuizResponse) error {
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

		rows, err := dbw.Queries.GetMyQuizForEditing(ctx, sqlc.GetMyQuizForEditingParams{
			Uuid:          quizUUID,
			UserAccountID: userId,
		})
		if err != nil {
			return logAndReturnError(err)
		}

		if len(rows) == 0 {
			return status.Wrap(logAndReturnErrorMessage(fmt.Sprintf("quiz with uuid %v does not exist for this user", input.UUID)), status.NotFound)
		}

		response := getQuizResponse{
			Questions: make([]models.Question, 0),
		}
		lastQuizId := int64(0)
		lastQuestionId := int64(0)

		for _, row := range rows {
			if lastQuizId != row.QuizID {
				lastQuizId = row.QuizID
				response.Title = row.QuizTitle
				response.Description = row.QuizDescription
				response.IsPublished = row.QuizIsPublished
				response.ImageUrl = row.QuizImageUrl
			}

			if lastQuestionId != row.QuestionID {
				lastQuestionId = row.QuestionID
				response.Questions = append(response.Questions, models.Question{
					UUID:                row.QuestionUuid.String(),
					CreatedAt:           row.QuestionCreatedAt,
					UpdatedAt:           row.QuestionUpdatedAt,
					Title:               row.QuestionTitle,
					Description:         row.QuestionDescription,
					ImageUrl:            row.QuestionImageUrl,
					Explanation:         row.QuestionExplanation,
					ExplanationImageUrl: row.QuestionExplanationImageUrl,
				})
			}

			response.Questions[len(response.Questions)-1].Answers = append(response.Questions[len(response.Questions)-1].Answers, models.Answer{
				UUID:        row.AnswerUuid.String(),
				CreatedAt:   row.AnswerCreatedAt,
				UpdatedAt:   row.AnswerUpdatedAt,
				Title:       row.AnswerTitle,
				Description: row.AnswerDescription,
				ImageUrl:    row.AnswerImageUrl,
				IsCorrect:   row.AnswerIsCorrect,
			})
		}

		*output = response
		return nil
	})
}
