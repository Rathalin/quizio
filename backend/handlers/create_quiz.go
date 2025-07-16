package handlers

import (
	"context"

	"github.com/swaggest/usecase"
	"github.com/swaggest/usecase/status"
)

func (dbw *DBWrapper) HandleCreateQuiz() usecase.Interactor {
	type createQuizRequestAnswer struct {
		Title       string  `json:"title" required:"true" validate:"required,min=1,max=100"`
		Description *string `json:"description" required:"true" nullable:"true" validate:"max=200"`
		ImageUrl    *string `json:"imageUrl" required:"true" nullable:"true"`
		IsCorrect   bool    `json:"isCorrect" required:"true" validate:"required"`
	}

	type createQuizRequestQuestion struct {
		Title               string                    `json:"title" required:"true" validate:"required,min=1,max=100"`
		Description         *string                   `json:"description" required:"true" nullable:"true" validate:"max=200"`
		ImageUrl            *string                   `json:"imageUrl" required:"true" nullable:"true"`
		Explanation         *string                   `json:"explanation" required:"true" nullable:"true" validation:"max=400"`
		ExplanationImageUrl *string                   `json:"explanationImageUrl" required:"true" nullable:"true"`
		Answers             []createQuizRequestAnswer `json:"answers" required:"true" nullable:"false" validate:"required,min=2,max=10"`
	}

	type createQuizRequest struct {
		Title       string                      `json:"title" required:"true" validate:"required,min=1,max=50"`
		Description *string                     `json:"description" required:"true" nullable:"true" validate:"max=200"`
		IsPublished bool                        `json:"isPublished" required:"true"`
		ImageUrl    *string                     `json:"imageUrl" required:"true" nullable:"true"`
		Questions   []createQuizRequestQuestion `json:"questions" required:"true" validate:"required,min=1,max=20"`
	}

	type createQuizResponse struct{}

	return usecase.NewInteractor(func(ctx context.Context, input createQuizRequest, output *createQuizResponse) error {
		userId, err := getUserIdFromContext(ctx)
		if err != nil {
			return logAndReturnError(err)
		}

		if err := validate.Struct(input); err != nil {
			return status.Wrap(logAndReturnError(err), status.InvalidArgument)
		}

		tx, err := dbw.DB.BeginTx(ctx, nil)
		if err != nil {
			return logAndReturnError(err)
		}

		defer tx.Rollback()

		var quizId int64

		err = tx.QueryRowContext(ctx, `
			INSERT INTO quiz (title, description_text, is_published, image_url, user_account_id)
			VALUES ($1, $2, $3, $4, $5)
			RETURNING id
		`, input.Title, input.Description, input.IsPublished, input.ImageUrl, userId).Scan(&quizId)
		if err != nil {
			return logAndReturnError(err)
		}

		for questionIndex, question := range input.Questions {
			var questionId int64

			err = tx.QueryRowContext(ctx, `
				INSERT INTO question (order_index, title, description_text, image_url, explanation, explanation_image_url, quiz_id)
				VALUES ($1, $2, $3, $4, $5, $6, $7)
				RETURNING id
			`, questionIndex, question.Title, question.Description, question.ImageUrl, question.Explanation, question.ExplanationImageUrl, quizId).Scan(&questionId)
			if err != nil {
				return logAndReturnError(err)
			}

			for answerIndex, answer := range question.Answers {
				_, err = tx.ExecContext(ctx, `
					INSERT INTO answer (order_index, title, description_text, image_url, is_correct, question_id)
					VALUES ($1, $2, $3, $4, $5, $6)
				`, answerIndex, answer.Title, answer.Description, answer.ImageUrl, answer.IsCorrect, questionId)
				if err != nil {
					return logAndReturnError(err)
				}
			}
		}
		err = tx.Commit()
		if err != nil {
			return logAndReturnError(err)
		}

		*output = createQuizResponse{}
		return nil
	})
}
