package handlers

import (
	"context"
	"fmt"
	"slices"

	"github.com/swaggest/usecase"
	"github.com/swaggest/usecase/status"
)

func (dbw *DBWrapper) HandleUpdateQuiz() usecase.Interactor {
	type updateQuizRequestAnswer struct {
		UUID        *string `json:"uuid" required:"true" nullable:"true" validate:"required,uuid4"`
		Title       string  `json:"title" required:"true" validate:"required,min=1,max=100"`
		Description *string `json:"description" required:"true" nullable:"true" validate:"max=200"`
		ImageUrl    *string `json:"imageUrl" required:"true" nullable:"true"`
		IsCorrect   bool    `json:"isCorrect" required:"true"`
	}

	type updateQuizRequestQuestion struct {
		UUID                *string                   `json:"uuid" required:"true" nullable:"true" validate:"required,uuid4"`
		Title               string                    `json:"title" required:"true" validate:"required,min=1,max=100"`
		Description         *string                   `json:"description" required:"true" nullable:"true" validate:"max=200"`
		ImageUrl            *string                   `json:"imageUrl" required:"true" nullable:"true"`
		Explanation         *string                   `json:"explanation" required:"true" nullable:"true" validation:"max=400"`
		ExplanationImageUrl *string                   `json:"explanationImageUrl" required:"true" nullable:"true"`
		Answers             []updateQuizRequestAnswer `json:"answers" required:"true" nullable:"false" validate:"required,min=1,max=10"`
	}

	type updateQuizRequest struct {
		UUID        string                      `path:"uuid" required:"true" validate:"required,uuid4"`
		Title       string                      `json:"title" required:"true" validate:"required,min=1,max=50"`
		Description *string                     `json:"description" required:"true" nullable:"true" validate:"max=200"`
		IsPublished bool                        `json:"isPublished" required:"true"`
		ImageUrl    *string                     `json:"imageUrl" required:"true" nullable:"true"`
		Questions   []updateQuizRequestQuestion `json:"questions" required:"true" nullable:"false" validate:"required,min=1,max=20"`
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
			return status.Wrap(logAndReturnErrorMessage("quiz does not exists (invalid uuid)"), status.NotFound)
		}

		quizExists, err := dbw.QuizExistsForUser(input.UUID, userId)
		if err != nil {
			return logAndReturnError(err)
		}
		if !quizExists {
			return status.Wrap(logAndReturnErrorMessage(fmt.Sprintf("quiz with uuid %v does not exist for this user", input.UUID)), status.NotFound)
		}

		quizId, err := dbw.GetQuizId(input.UUID)
		if err != nil {
			return logAndReturnError(err)
		}

		tx, err := dbw.DB.BeginTx(ctx, nil)
		if err != nil {
			return logAndReturnError(err)
		}
		defer tx.Rollback()

		// Update quiz details
		_, err = tx.ExecContext(ctx, `
			UPDATE quiz
			SET title = $1, description_text = $2, is_published = $3, image_url = $4
			WHERE uuid = $5
		`, input.Title, input.Description, input.IsPublished, input.ImageUrl, input.UUID)
		if err != nil {
			return logAndReturnError(err)
		}

		// Handle questions
		existingQuestionUuids := []string{}
		rows, err := tx.QueryContext(ctx, `
			SELECT uuid
			FROM question
			WHERE quiz_id = $1
		`, quizId)
		if err != nil {
			return logAndReturnError(err)
		}
		defer rows.Close()
		for rows.Next() {
			questionUuid := ""
			err = rows.Scan(&questionUuid)
			existingQuestionUuids = append(existingQuestionUuids, questionUuid)
			if err != nil {
				return logAndReturnError(err)
			}
		}

		remainingQuestionUuids := append(existingQuestionUuids[:0:0], existingQuestionUuids...)

		for questionIndex, questionInput := range input.Questions {
			var questionId int64
			if questionInput.UUID != nil && slices.Contains(existingQuestionUuids, *questionInput.UUID) {
				// Update existing question
				err = tx.QueryRowContext(ctx, `
					UPDATE question
					SET order_index = $1, title = $2, description_text = $3, image_url = $4, explanation = $5, explanation_image_url = $6
					WHERE uuid = $7
					RETURNING id
				`,
					questionIndex,
					questionInput.Title,
					questionInput.Description,
					questionInput.ImageUrl,
					questionInput.Explanation,
					questionInput.ExplanationImageUrl,
					questionInput.UUID,
				).Scan(&questionId)
				if err != nil {
					return logAndReturnError(err)
				}

				// Remove from remainingQuestionUuids
				uuidIndex := slices.Index(remainingQuestionUuids, *questionInput.UUID)
				remainingQuestionUuids = slices.Delete(remainingQuestionUuids, uuidIndex, uuidIndex+1)

			} else {
				// Insert new question
				err = tx.QueryRowContext(ctx, `
						INSERT INTO question (order_index, title, description_text, image_url, explanation, explanation_image_url, quiz_id)
						VALUES ($1, $2, $3, $4, $5, $6, $7)
						RETURNING id
				`,
					questionIndex,
					questionInput.Title,
					questionInput.Description,
					questionInput.ImageUrl,
					questionInput.Explanation,
					questionInput.ExplanationImageUrl,
					quizId,
				).Scan(&questionId)
				if err != nil {
					return logAndReturnError(err)
				}
			}

			// Handle answers for the current question
			existingAnswerUuids := []string{}
			answerRows, err := tx.QueryContext(ctx, `
					SELECT uuid
					FROM answer
					WHERE question_id = $1
			`, questionId)
			if err != nil {
				return logAndReturnError(err)
			}
			defer answerRows.Close()
			for answerRows.Next() {
				answerUuid := ""
				err = answerRows.Scan(&answerUuid)
				existingAnswerUuids = append(existingAnswerUuids, answerUuid)
				if err != nil {
					return logAndReturnError(err)
				}
			}

			remainingAnswerUuids := append(existingAnswerUuids[:0:0], existingAnswerUuids...)

			for answerIndex, answerInput := range questionInput.Answers {
				if answerInput.UUID != nil && slices.Contains(existingAnswerUuids, *answerInput.UUID) {
					// Update existing answer
					_, err = tx.ExecContext(ctx, `
							UPDATE answer
							SET order_index = $1, title = $2, description_text = $3, image_url = $4, is_correct = $5
							WHERE uuid = $6
					`, answerIndex, answerInput.Title, answerInput.Description, answerInput.ImageUrl, answerInput.IsCorrect, answerInput.UUID)
					if err != nil {
						return logAndReturnError(err)
					}

					// Remove from remainingAnswerUuids
					uuidIndex := slices.Index(remainingAnswerUuids, *answerInput.UUID)
					remainingAnswerUuids = slices.Delete(remainingAnswerUuids, uuidIndex, uuidIndex+1)
				} else {
					// Insert new answer
					_, err = tx.ExecContext(ctx, `
							INSERT INTO answer (order_index, title, description_text, image_url, is_correct, question_id)
							VALUES ($1, $2, $3, $4, $5, $6)
					`, answerIndex, answerInput.Title, answerInput.Description, answerInput.ImageUrl, answerInput.IsCorrect, questionId)
					if err != nil {
						return logAndReturnError(err)
					}
				}
			}

			// Delete removed answers
			for _, answerUuid := range remainingAnswerUuids {
				_, err = tx.ExecContext(ctx, `
						DELETE FROM answer WHERE uuid = $1
				`, answerUuid)
				if err != nil {
					return logAndReturnError(err)
				}
			}
		}

		// Delete removed questions
		for _, questionUuid := range remainingQuestionUuids {
			_, err = tx.ExecContext(ctx, `
					DELETE FROM question WHERE uuid = $1
			`, questionUuid)
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
