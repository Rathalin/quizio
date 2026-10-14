package handlers

import (
	"context"

	"github.com/swaggest/usecase"
	"github.com/swaggest/usecase/status"
)

func (dbw *DBWrapper) DeleteMyQuiz() usecase.Interactor {
	type deleteQuizRequest struct {
		QuizUUID string `path:"uuid" required:"true" validate:"required,uuid4"`
	}

	type deleteQuizResponse struct{}

	return usecase.NewInteractor(func(ctx context.Context, input deleteQuizRequest, output *deleteQuizResponse) error {
		userId, err := getUserIdFromContext(ctx)
		if err != nil {
			return logAndReturnError(err)
		}

		if !isValidUUID(input.QuizUUID) {
			return status.Wrap(logAndReturnErrorMessage("quiz does not exist (invalid uuid)"), status.NotFound)
		}

		if err := validate.Struct(input); err != nil {
			return status.Wrap(logAndReturnError(err), status.InvalidArgument)
		}

		userUuid, err := dbw.GetUserUuid(ctx, userId)
		if err != nil {
			return logAndReturnError(err)
		}

		// Collect images of quiz to delete after DB deletion succeeds
		var filesToDelete []string

		var quizImageUrl *string
		err = dbw.DB.QueryRowContext(ctx, `
			SELECT image_url
			FROM quiz
			WHERE uuid = $1 AND user_account_id = $2
		`, input.QuizUUID, userId).Scan(&quizImageUrl)
		if err != nil {
			return logAndReturnError(err)
		}
		if quizImageUrl != nil {
			filesToDelete = append(filesToDelete, GetFilenameFromUrl(*quizImageUrl))
		}

		questionRows, err := dbw.DB.QueryContext(ctx, `
			SELECT qn.image_url, qn.explanation_image_url
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
			var imgUrl, expImgUrl *string
			if err := questionRows.Scan(&imgUrl, &expImgUrl); err != nil {
				return logAndReturnError(err)
			}
			if imgUrl != nil {
				filesToDelete = append(filesToDelete, GetFilenameFromUrl(*imgUrl))
			}
			if expImgUrl != nil {
				filesToDelete = append(filesToDelete, GetFilenameFromUrl(*expImgUrl))
			}
		}
		if err := questionRows.Err(); err != nil {
			return logAndReturnError(err)
		}

		answerRows, err := dbw.DB.QueryContext(ctx, `
			SELECT a.image_url
			FROM answer a
			JOIN question qn
				ON a.question_id = qn.id
			JOIN quiz q
				ON qn.quiz_id = q.id
			WHERE q.uuid = $1 AND a.image_url IS NOT NULL
		`, input.QuizUUID)
		if err != nil {
			return logAndReturnError(err)
		}
		defer answerRows.Close()

		for answerRows.Next() {
			var ansImgUrl *string
			if err := answerRows.Scan(&ansImgUrl); err != nil {
				return logAndReturnError(err)
			}
			if ansImgUrl != nil {
				filesToDelete = append(filesToDelete, GetFilenameFromUrl(*ansImgUrl))
			}
		}
		if err := answerRows.Err(); err != nil {
			return logAndReturnError(err)
		}

		// Delete quiz from DB
		_, err = dbw.DB.ExecContext(ctx, `
			DELETE FROM quiz
			WHERE uuid = $1 AND user_account_id = $2
		`, input.QuizUUID, userId)
		if err != nil {
			return logAndReturnError(err)
		}

		// Delete files after DB deletion succeeds
		for _, filename := range filesToDelete {
			DeleteFile(filename, userUuid)
		}

		*output = deleteQuizResponse{}
		return nil
	})
}
