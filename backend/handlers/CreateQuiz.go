package handlers

import (
	"context"
	"fmt"

	"github.com/swaggest/usecase"
)

func (dbw *DBWrapper) CreateQuiz() usecase.Interactor {
	type createQuizRequestAnswer struct {
		Title       string  `json:"title" required:"true"`
		Description *string `json:"description" required:"true" nullable:"true"`
		ImageUrl    *string `json:"imageUrl" required:"true" nullable:"true"`
		IsCorrect   bool    `json:"isCorrect" required:"true"`
	}

	type createQuizRequestQuestion struct {
		Title               string                    `json:"title" required:"true"`
		Description         *string                   `json:"description" required:"true" nullable:"true"`
		ImageUrl            *string                   `json:"imageUrl" required:"true" nullable:"true"`
		Explanation         *string                   `json:"explanation" required:"true" nullable:"true"`
		ExplanationImageUrl *string                   `json:"explanationImageUrl" required:"true" nullable:"true"`
		Answers             []createQuizRequestAnswer `json:"answers" required:"true" nullable:"false"`
	}

	type createQuizRequest struct {
		Title       string                      `json:"title" required:"true"`
		Description *string                     `json:"description" required:"true" nullable:"true"`
		IsPublished bool                        `json:"isPublished" required:"true"`
		ImageUrl    *string                     `json:"imageUrl" required:"true" nullable:"true"`
		Questions   []createQuizRequestQuestion `json:"questions" required:"true"`
	}

	type createQuizResponse struct{}

	return usecase.NewInteractor(func(ctx context.Context, input createQuizRequest, output *createQuizResponse) error {
		tx, err := dbw.DB.BeginTx(ctx, nil)
		if err != nil {
			return err
		}

		defer tx.Rollback()

		var quizId int64

		err = tx.QueryRowContext(ctx, `
			INSERT INTO quiz (title, description_text, is_published, image_url, user_account_id)
			VALUES ($1, $2, $3, $4, $5)
			RETURNING id
		`, input.Title, input.Description, input.IsPublished, input.ImageUrl, 1).Scan(&quizId)
		if err != nil {
			fmt.Println(err)
			return err
		}

		for _, question := range input.Questions {
			var questionId int64

			err = tx.QueryRowContext(ctx, `
				INSERT INTO question (title, description_text, image_url, explanation, explanation_image_url, quiz_id)
				VALUES ($1, $2, $3, $4, $5, $6)
				RETURNING id
			`, question.Title, question.Description, question.ImageUrl, question.Explanation, question.ExplanationImageUrl, quizId).Scan(&questionId)
			if err != nil {
				return err
			}

			for _, answer := range question.Answers {
				_, err = tx.ExecContext(ctx, `
					INSERT INTO answer (title, description_text, image_url, is_correct, question_id)
					VALUES ($1, $2, $3, $4, $5)
				`, answer.Title, answer.Description, answer.ImageUrl, answer.IsCorrect, questionId)
				if err != nil {
					return err
				}
			}
		}
		err = tx.Commit()
		if err != nil {
			return err
		}

		response := createQuizResponse{}
		*output = response
		return nil
	})
}
