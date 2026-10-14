package handlers

import (
	"context"

	"github.com/Rathalin/quizio/backend/db/sqlc"
	"github.com/swaggest/usecase"
	"github.com/swaggest/usecase/status"
)

func (dbw *DBWrapper) CreateMyQuiz() usecase.Interactor {
	type createQuizRequestAnswer struct {
		Title       string  `json:"title" required:"true" validate:"required,min=1,max=100"`
		Description string  `json:"description" required:"true" validate:"max=200"`
		ImageUrl    *string `json:"imageUrl" required:"true" nullable:"true"`
		IsCorrect   bool    `json:"isCorrect" required:"true" validate:"required"`
	}

	type createQuizRequestQuestion struct {
		Title               string                    `json:"title" required:"true" validate:"required,min=1,max=100"`
		Description         *string                   `json:"description" required:"true" nullable:"true" validate:"max=200"`
		ImageUrl            *string                   `json:"imageUrl" required:"true" nullable:"true"`
		Explanation         *string                   `json:"explanation" required:"true" nullable:"true" validate:"max=400"`
		ExplanationImageUrl *string                   `json:"explanationImageUrl" required:"true" nullable:"true"`
		Answers             []createQuizRequestAnswer `json:"answers" required:"true" nullable:"false" validate:"required,min=2,max=10,dive"`
	}

	type createQuizRequest struct {
		Title       string                      `json:"title" required:"true" validate:"required,min=1,max=50"`
		Description string                      `json:"description" required:"true" validate:"max=200"`
		IsPublished bool                        `json:"isPublished" required:"true"`
		ImageUrl    *string                     `json:"imageUrl" required:"true" nullable:"true"`
		Questions   []createQuizRequestQuestion `json:"questions" required:"true" validate:"required,min=1,max=20,dive"`
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

		qtx := dbw.Queries.WithTx(tx)

		quizId, err := qtx.CreateQuiz(ctx, sqlc.CreateQuizParams{
			Title:           input.Title,
			DescriptionText: &input.Description,
			IsPublished:     input.IsPublished,
			ImageUrl:        input.ImageUrl,
			UserAccountID:   userId,
		})
		if err != nil {
			return logAndReturnError(err)
		}

		for questionIndex, question := range input.Questions {
			questionId, err := qtx.CreateQuestion(ctx, sqlc.CreateQuestionParams{
				OrderIndex:          int32(questionIndex),
				Title:               question.Title,
				DescriptionText:     question.Description,
				ImageUrl:            question.ImageUrl,
				Explanation:         question.Explanation,
				ExplanationImageUrl: question.ExplanationImageUrl,
				QuizID:              quizId,
			})
			if err != nil {
				return logAndReturnError(err)
			}

			for answerIndex, answer := range question.Answers {
				err = qtx.CreateAnswer(ctx, sqlc.CreateAnswerParams{
					OrderIndex:      int32(answerIndex),
					Title:           answer.Title,
					DescriptionText: &answer.Description,
					ImageUrl:        answer.ImageUrl,
					IsCorrect:       answer.IsCorrect,
					QuestionID:      questionId,
				})
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
