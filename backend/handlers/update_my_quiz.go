package handlers

import (
	"context"
	"slices"

	"github.com/Rathalin/quizio/backend/db/sqlc"
	"github.com/google/uuid"
	"github.com/swaggest/usecase"
	"github.com/swaggest/usecase/status"
)

func (dbw *DBWrapper) UpdateMyQuiz() usecase.Interactor {
	type updateQuizRequestAnswer struct {
		UUID        *string `json:"uuid" required:"true" nullable:"true" validate:"omitempty,uuid4"`
		Title       string  `json:"title" required:"true" validate:"required,min=1,max=100"`
		Description string  `json:"description" required:"true" validate:"max=200"`
		ImageUrl    *string `json:"imageUrl" required:"true" nullable:"true"`
		IsCorrect   bool    `json:"isCorrect" required:"true"`
	}

	type updateQuizRequestQuestion struct {
		UUID                *string                   `json:"uuid" required:"true" nullable:"true" validate:"omitempty,uuid4"`
		Title               string                    `json:"title" required:"true" validate:"required,min=1,max=100"`
		Description         *string                   `json:"description" required:"true" nullable:"true" validate:"max=200"`
		ImageUrl            *string                   `json:"imageUrl" required:"true" nullable:"true"`
		Explanation         *string                   `json:"explanation" required:"true" nullable:"true" validate:"max=400"`
		ExplanationImageUrl *string                   `json:"explanationImageUrl" required:"true" nullable:"true"`
		Answers             []updateQuizRequestAnswer `json:"answers" required:"true" nullable:"false" validate:"required,min=2,max=10,dive"`
	}

	type updateQuizRequest struct {
		UUID        string                      `path:"uuid" required:"true" validate:"required,uuid4"`
		Title       string                      `json:"title" required:"true" validate:"required,min=1,max=50"`
		Description string                      `json:"description" required:"true" validate:"max=200"`
		IsPublished bool                        `json:"isPublished" required:"true"`
		ImageUrl    *string                     `json:"imageUrl" required:"true" nullable:"true"`
		Questions   []updateQuizRequestQuestion `json:"questions" required:"true" nullable:"false" validate:"required,min=1,max=20,dive"`
	}

	type updateQuizResponse struct{}

	return usecase.NewInteractor(func(ctx context.Context, input updateQuizRequest, output *updateQuizResponse) error {
		userId, err := getUserIdFromContext(ctx)
		if err != nil {
			return logAndReturnError(err)
		}

		if err := validate.Struct(input); err != nil {
			return status.Wrap(logAndReturnError(err), status.InvalidArgument)
		}

		if !isValidUUID(input.UUID) {
			return status.Wrap(logAndReturnErrorMessage("quiz does not exist (invalid uuid)"), status.NotFound)
		}

		quizUUID, err := uuid.Parse(input.UUID)
		if err != nil {
			return status.Wrap(logAndReturnErrorMessage("quiz does not exist (invalid uuid)"), status.NotFound)
		}

		tx, err := dbw.DB.BeginTx(ctx, nil)
		if err != nil {
			return logAndReturnError(err)
		}
		defer tx.Rollback()

		qtx := dbw.Queries.WithTx(tx)

		// Update quiz details
		quizId, err := qtx.UpdateQuizDetails(ctx, sqlc.UpdateQuizDetailsParams{
			Title:           input.Title,
			DescriptionText: &input.Description,
			IsPublished:     input.IsPublished,
			ImageUrl:        input.ImageUrl,
			Uuid:            quizUUID,
			UserAccountID:   userId,
		})
		if err != nil {
			return logAndReturnError(err)
		}

		// Handle questions
		existingQuestionUuidsRaw, err := qtx.GetQuestionUuidsByQuizId(ctx, quizId)
		if err != nil {
			return logAndReturnError(err)
		}
		existingQuestionUuids := make([]string, len(existingQuestionUuidsRaw))
		for i, u := range existingQuestionUuidsRaw {
			existingQuestionUuids[i] = u.String()
		}

		remainingQuestionUuids := append(existingQuestionUuids[:0:0], existingQuestionUuids...)

		for questionIndex, questionInput := range input.Questions {
			var questionId int64
			if questionInput.UUID != nil && slices.Contains(existingQuestionUuids, *questionInput.UUID) {
				// Update existing question
				qUUID, err := uuid.Parse(*questionInput.UUID)
				if err != nil {
					return logAndReturnError(err)
				}
				questionId, err = qtx.UpdateQuestion(ctx, sqlc.UpdateQuestionParams{
					OrderIndex:          int32(questionIndex),
					Title:               questionInput.Title,
					DescriptionText:     questionInput.Description,
					ImageUrl:            questionInput.ImageUrl,
					Explanation:         questionInput.Explanation,
					ExplanationImageUrl: questionInput.ExplanationImageUrl,
					Uuid:                qUUID,
				})
				if err != nil {
					return logAndReturnError(err)
				}

				// Remove from remainingQuestionUuids
				uuidIndex := slices.Index(remainingQuestionUuids, *questionInput.UUID)
				remainingQuestionUuids = slices.Delete(remainingQuestionUuids, uuidIndex, uuidIndex+1)

			} else {
				// Insert new question
				questionId, err = qtx.CreateQuestion(ctx, sqlc.CreateQuestionParams{
					OrderIndex:          int32(questionIndex),
					Title:               questionInput.Title,
					DescriptionText:     questionInput.Description,
					ImageUrl:            questionInput.ImageUrl,
					Explanation:         questionInput.Explanation,
					ExplanationImageUrl: questionInput.ExplanationImageUrl,
					QuizID:              quizId,
				})
				if err != nil {
					return logAndReturnError(err)
				}
			}

			// Handle answers for the current question
			existingAnswerUuidsRaw, err := qtx.GetAnswerUuidsByQuestionId(ctx, questionId)
			if err != nil {
				return logAndReturnError(err)
			}
			existingAnswerUuids := make([]string, len(existingAnswerUuidsRaw))
			for i, u := range existingAnswerUuidsRaw {
				existingAnswerUuids[i] = u.String()
			}

			remainingAnswerUuids := append(existingAnswerUuids[:0:0], existingAnswerUuids...)

			for answerIndex, answerInput := range questionInput.Answers {
				if answerInput.UUID != nil && slices.Contains(existingAnswerUuids, *answerInput.UUID) {
					// Update existing answer
					aUUID, err := uuid.Parse(*answerInput.UUID)
					if err != nil {
						return logAndReturnError(err)
					}
					err = qtx.UpdateAnswer(ctx, sqlc.UpdateAnswerParams{
						OrderIndex:      int32(answerIndex),
						Title:           answerInput.Title,
						DescriptionText: &answerInput.Description,
						ImageUrl:        answerInput.ImageUrl,
						IsCorrect:       answerInput.IsCorrect,
						Uuid:            aUUID,
					})
					if err != nil {
						return logAndReturnError(err)
					}

					// Remove from remainingAnswerUuids
					uuidIndex := slices.Index(remainingAnswerUuids, *answerInput.UUID)
					remainingAnswerUuids = slices.Delete(remainingAnswerUuids, uuidIndex, uuidIndex+1)
				} else {
					// Insert new answer
					err = qtx.CreateAnswer(ctx, sqlc.CreateAnswerParams{
						OrderIndex:      int32(answerIndex),
						Title:           answerInput.Title,
						DescriptionText: &answerInput.Description,
						ImageUrl:        answerInput.ImageUrl,
						IsCorrect:       answerInput.IsCorrect,
						QuestionID:      questionId,
					})
					if err != nil {
						return logAndReturnError(err)
					}
				}
			}

			// Delete removed answers
			for _, answerUuid := range remainingAnswerUuids {
				aUUID, err := uuid.Parse(answerUuid)
				if err != nil {
					return logAndReturnError(err)
				}
				err = qtx.DeleteAnswerByUuid(ctx, aUUID)
				if err != nil {
					return logAndReturnError(err)
				}
			}
		}

		// Delete removed questions
		for _, questionUuid := range remainingQuestionUuids {
			qUUID, err := uuid.Parse(questionUuid)
			if err != nil {
				return logAndReturnError(err)
			}
			err = qtx.DeleteQuestionByUuid(ctx, qUUID)
			if err != nil {
				return logAndReturnError(err)
			}
		}

		if err := tx.Commit(); err != nil {
			return logAndReturnError(err)
		}

		*output = updateQuizResponse{}
		return nil
	})
}
