package handlers

import (
	"context"
	"fmt"
	"slices"

	"github.com/swaggest/usecase"
	"github.com/swaggest/usecase/status"
)

func (dbw *DBWrapper) EditQuiz() usecase.Interactor {
	type editQuizRequestAnswer struct {
		UUID        *string `json:"uuid" required:"true" nullable:"true"`
		Title       string  `json:"title" required:"true"`
		Description *string `json:"description" required:"true" nullable:"true"`
		ImageUrl    *string `json:"imageUrl" required:"true" nullable:"true"`
		IsCorrect   bool    `json:"isCorrect" required:"true"`
	}

	type editQuizRequestQuestion struct {
		UUID                *string                 `json:"uuid" required:"true" nullable:"true"`
		Title               string                  `json:"title" required:"true"`
		Description         *string                 `json:"description" required:"true" nullable:"true"`
		ImageUrl            *string                 `json:"imageUrl" required:"true" nullable:"true"`
		Explanation         *string                 `json:"explanation" required:"true" nullable:"true"`
		ExplanationImageUrl *string                 `json:"explanationImageUrl" required:"true" nullable:"true"`
		Answers             []editQuizRequestAnswer `json:"answers" required:"true" nullable:"false"`
	}

	type editQuizRequest struct {
		UUID        string                    `path:"uuid" required:"true"`
		Title       string                    `json:"title" required:"true"`
		Description *string                   `json:"description" required:"true" nullable:"true"`
		IsPublished bool                      `json:"isPublished" required:"true"`
		ImageUrl    *string                   `json:"imageUrl" required:"true" nullable:"true"`
		Questions   []editQuizRequestQuestion `json:"questions" required:"true"`
	}

	type editQuizResponse struct{}

	return usecase.NewInteractor(func(ctx context.Context, input editQuizRequest, output *editQuizResponse) error {
		userId, err := getUserIdFromContext(ctx)
		if err != nil {
			return err
		}

		quizExists, err := dbw.QuizExistsForUser(input.UUID, userId)
		if err != nil {
			return err
		}
		if !quizExists {
			return status.Wrap(fmt.Errorf("quiz with uuid %v does not exist for this user", input.UUID), status.NotFound)
		}

		quizId, err := dbw.GetQuizId(input.UUID)
		if err != nil {
			return err
		}

		fmt.Printf("Begin transaction\n")
		tx, err := dbw.DB.BeginTx(ctx, nil)
		if err != nil {
			return err
		}
		defer tx.Rollback()

		// Update quiz details
		fmt.Printf("UPDATE quiz: %v, %v, %v, %v\n", input.Title, checkNil(input.Description), input.IsPublished, checkNil(input.ImageUrl))
		_, err = tx.ExecContext(ctx, `
			UPDATE quiz
			SET title = $1, description_text = $2, is_published = $3, image_url = $4
			WHERE uuid = $5
		`, input.Title, input.Description, input.IsPublished, input.ImageUrl, input.UUID)
		if err != nil {
			return err
		}

		// Handle questions
		existingQuestionUuids := []string{}
		rows, err := tx.QueryContext(ctx, `
			SELECT uuid
			FROM question
			WHERE quiz_id = $1
		`, quizId)
		if err != nil {
			return err
		}
		defer rows.Close()
		for rows.Next() {
			questionUuid := ""
			err = rows.Scan(&questionUuid)
			existingQuestionUuids = append(existingQuestionUuids, questionUuid)
			if err != nil {
				return err
			}
		}

		remainingQuestionUuids := append(existingQuestionUuids[:0:0], existingQuestionUuids...)

		for _, questionInput := range input.Questions {
			var questionId int64
			if questionInput.UUID != nil && slices.Contains(existingQuestionUuids, *questionInput.UUID) {
				// Update existing question
				fmt.Printf("UPDATE question %v: %v, %v, %v, %v, %v\n",
					*questionInput.UUID, questionInput.Title, checkNil(questionInput.Description), checkNil(questionInput.ImageUrl), checkNil(questionInput.Explanation), checkNil(questionInput.ExplanationImageUrl),
				)
				err = tx.QueryRowContext(ctx, `
					UPDATE question
					SET title = $1, description_text = $2, image_url = $3, explanation = $4, explanation_image_url = $5
					WHERE uuid = $6
					RETURNING id
				`,
					questionInput.Title,
					questionInput.Description,
					questionInput.ImageUrl,
					questionInput.Explanation,
					questionInput.ExplanationImageUrl,
					questionInput.UUID,
				).Scan(&questionId)
				if err != nil {
					return err
				}

				// Remove from remainingQuestionUuids
				uuidIndex := slices.Index(remainingQuestionUuids, *questionInput.UUID)
				remainingQuestionUuids = slices.Delete(remainingQuestionUuids, uuidIndex, uuidIndex+1)

			} else {
				// Insert new question
				fmt.Printf("INSERT question: %v, %v, %v, %v, %v\n",
					questionInput.Title,
					checkNil(questionInput.Description),
					checkNil(questionInput.ImageUrl),
					checkNil(questionInput.Explanation),
					checkNil(questionInput.ExplanationImageUrl),
				)
				err = tx.QueryRowContext(ctx, `
						INSERT INTO question (title, description_text, image_url, explanation, explanation_image_url, quiz_id)
						VALUES ($1, $2, $3, $4, $5, $6)
						RETURNING id
				`,
					questionInput.Title,
					questionInput.Description,
					questionInput.ImageUrl,
					questionInput.Explanation,
					questionInput.ExplanationImageUrl,
					quizId,
				).Scan(&questionId)
				if err != nil {
					return err
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
				return err
			}
			defer answerRows.Close()
			for answerRows.Next() {
				answerUuid := ""
				err = answerRows.Scan(&answerUuid)
				existingAnswerUuids = append(existingAnswerUuids, answerUuid)
				if err != nil {
					return err
				}
			}

			remainingAnswerUuids := append(existingAnswerUuids[:0:0], existingAnswerUuids...)

			for _, answerInput := range questionInput.Answers {
				if answerInput.UUID != nil && slices.Contains(existingAnswerUuids, *answerInput.UUID) {
					// Update existing answer
					fmt.Printf("UPDATE answer %v: %v, %v, %v, %v\n", *answerInput.UUID, answerInput.Title, checkNil(answerInput.Description), checkNil(answerInput.ImageUrl), answerInput.IsCorrect)
					_, err = tx.ExecContext(ctx, `
							UPDATE answer
							SET title = $1, description_text = $2, image_url = $3, is_correct = $4
							WHERE uuid = $5
					`, answerInput.Title, answerInput.Description, answerInput.ImageUrl, answerInput.IsCorrect, answerInput.UUID)
					if err != nil {
						return err
					}

					// Remove from remainingAnswerUuids
					uuidIndex := slices.Index(remainingAnswerUuids, *answerInput.UUID)
					remainingAnswerUuids = slices.Delete(remainingAnswerUuids, uuidIndex, uuidIndex+1)
				} else {
					// Insert new answer
					fmt.Printf("INSERT answer: %v, %v, %v, %v\n", answerInput.Title, checkNil(answerInput.Description), checkNil(answerInput.ImageUrl), answerInput.IsCorrect)
					_, err = tx.ExecContext(ctx, `
							INSERT INTO answer (title, description_text, image_url, is_correct, question_id)
							VALUES ($1, $2, $3, $4, $5)
					`, answerInput.Title, answerInput.Description, answerInput.ImageUrl, answerInput.IsCorrect, questionId)
					if err != nil {
						return err
					}
				}
			}

			// Delete removed answers
			for _, answerUuid := range remainingAnswerUuids {
				fmt.Printf("DELETE answer: %v\n", answerUuid)
				_, err = tx.ExecContext(ctx, `
						DELETE FROM answer WHERE uuid = $1
				`, answerUuid)
				if err != nil {
					return err
				}
			}
		}

		// Delete removed questions
		for _, questionUuid := range remainingQuestionUuids {
			fmt.Printf("DELETE question: %v\n", questionUuid)
			_, err = tx.ExecContext(ctx, `
					DELETE FROM question WHERE uuid = $1
			`, questionUuid)
			if err != nil {
				return err
			}
		}

		if err := tx.Commit(); err != nil {
			return err
		}
		fmt.Printf("End of transaction\n")

		*output = editQuizResponse{}
		return nil
	})
}
