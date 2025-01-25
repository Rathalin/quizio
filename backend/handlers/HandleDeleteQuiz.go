package handlers

import (
	"context"
	"fmt"

	"github.com/swaggest/usecase"
	"github.com/swaggest/usecase/status"
)

func (dbw *DBWrapper) HandleDeleteQuiz() usecase.Interactor {
	type deleteQuizRequest struct {
		QuizUUID string `path:"uuid" required:"true"`
	}

	type deleteQuizResponse struct{}

	return usecase.NewInteractor(func(ctx context.Context, input deleteQuizRequest, output *deleteQuizResponse) error {
		userId, err := getUserIdFromContext(ctx)
		if err != nil {
			return logAndReturnError(err)
		}

		quizExists, err := dbw.QuizExistsForUser(input.QuizUUID, userId)
		if err != nil {
			return logAndReturnError(err)
		}
		if !quizExists {
			return status.Wrap(logAndReturnErrorMessage(fmt.Sprintf("quiz with uuid %v does not exist for this user", input.QuizUUID)), status.NotFound)
		}

		userUuid, err := dbw.GetUserUuid(userId)
		if err != nil {
			return logAndReturnError(err)
		}

		// Delete images of quiz
		var quizImageUrl *string
		err = dbw.DB.QueryRowContext(ctx, `
			SELECT image_url
			FROM quiz
			WHERE uuid = $1
		`, input.QuizUUID).Scan(&quizImageUrl)
		if err != nil {
			return logAndReturnError(err)
		}
		if quizImageUrl != nil {
			DeleteFile(GetFilenameFromUrl(*quizImageUrl), userUuid)
		}

		type questionRow struct {
			ID                  string
			ImageUrl            *string
			ExplanationImageUrl *string
		}

		questionRows, err := dbw.DB.QueryContext(ctx, `
			SELECT qn.id, qn.image_url, qn.explanation_image_url
			FROM question qn
			JOIN quiz q
				ON qn.quiz_id = q.id
			WHERE q.uuid = $1
		`, input.QuizUUID)
		if err != nil {
			return logAndReturnError(err)
		}
		defer questionRows.Close()

		for questionRows.Next() {
			questionRow := questionRow{}
			err = questionRows.Scan(&questionRow.ID, &questionRow.ImageUrl, &questionRow.ExplanationImageUrl)
			if err != nil {
				return logAndReturnError(err)
			}
			if questionRow.ImageUrl != nil {
				DeleteFile(GetFilenameFromUrl(*questionRow.ImageUrl), userUuid)
			}
			if questionRow.ExplanationImageUrl != nil {
				DeleteFile(GetFilenameFromUrl(*questionRow.ExplanationImageUrl), userUuid)
			}

			type answerRow struct {
				ImageUrl *string
			}

			answerRows, err := dbw.DB.QueryContext(ctx, `
				SELECT image_url
				FROM answer
				WHERE question_id = $1
			`, questionRow.ID)
			if err != nil {
				return logAndReturnError(err)
			}
			defer answerRows.Close()

			for answerRows.Next() {
				answerRow := answerRow{}
				err = answerRows.Scan(&answerRow.ImageUrl)
				if err != nil {
					return logAndReturnError(err)
				}
				if answerRow.ImageUrl != nil {
					DeleteFile(GetFilenameFromUrl(*answerRow.ImageUrl), userUuid)
				}
			}
		}

		// Delete quiz

		_, err = dbw.DB.ExecContext(ctx, `
			DELETE FROM quiz
			WHERE uuid = $1
		`, input.QuizUUID)
		if err != nil {
			return logAndReturnError(err)
		}

		*output = deleteQuizResponse{}
		return nil
	})
}
