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
		quizExists, err := dbw.quizExists(input.UUID)
		if err != nil {
			return err
		}
		if !quizExists {
			return status.Wrap(fmt.Errorf("quiz with uuid %v does not exist", input.UUID), status.NotFound)
		}
		tx, err := dbw.DB.BeginTx(ctx, nil)
		if err != nil {
			return err
		}
		defer tx.Rollback()

		// Update quiz details
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
		`, input.UUID)
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

		for _, question := range input.Questions {
			if question.UUID != nil && slices.Contains(existingQuestionUuids, *question.UUID) {
				// Update existing question
				_, err = tx.ExecContext(ctx, `
            UPDATE question
            SET title = $1, description_text = $2, image_url = $3, explanation = $4, explanation_image_url = $5
            WHERE uuid = $6
        `, question.Title, question.Description, question.ImageUrl, question.Explanation, question.ExplanationImageUrl, *question.UUID)
				// Delete fron existingUuids slice
				uuidIndex := slices.Index(remainingQuestionUuids, *question.UUID)
				remainingQuestionUuids = slices.Delete(remainingQuestionUuids, uuidIndex, uuidIndex)
			} else {
				// Insert new question
				_, err = tx.ExecContext(ctx, `
            INSERT INTO question (title, description_text, image_url, explanation, explanation_image_url, quiz_id)
            VALUES ($1, $2, $3, $4, $5, $6)
        `, question.Title, question.Description, question.ImageUrl, question.Explanation, question.ExplanationImageUrl, input.UUID)
			}
			if err != nil {
				return err
			}

		}

		// Delete removed questions
		for _, questionUuid := range remainingQuestionUuids {
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
		response := editQuizResponse{}
		*output = response
		return nil
	})
}
