package handlers

import (
	"context"

	"github.com/Rathalin/quizio/backend/db/sqlc"
	"github.com/google/uuid"
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

		quizUUID, err := uuid.Parse(input.QuizUUID)
		if err != nil {
			return status.Wrap(logAndReturnErrorMessage("quiz does not exist (invalid uuid)"), status.NotFound)
		}

		userUuid, err := dbw.GetUserUuid(ctx, userId)
		if err != nil {
			return logAndReturnError(err)
		}

		// Collect images of quiz to delete after DB deletion succeeds
		var filesToDelete []string

		quizImageUrl, err := dbw.Queries.GetQuizImageUrlForUser(ctx, sqlc.GetQuizImageUrlForUserParams{
			Uuid:          quizUUID,
			UserAccountID: userId,
		})
		if err != nil {
			return logAndReturnError(err)
		}
		if quizImageUrl != nil {
			filesToDelete = append(filesToDelete, GetFilenameFromUrl(*quizImageUrl))
		}

		questionImages, err := dbw.Queries.GetQuizQuestionImages(ctx, quizUUID)
		if err != nil {
			return logAndReturnError(err)
		}
		for _, qn := range questionImages {
			if qn.ImageUrl != nil {
				filesToDelete = append(filesToDelete, GetFilenameFromUrl(*qn.ImageUrl))
			}
			if qn.ExplanationImageUrl != nil {
				filesToDelete = append(filesToDelete, GetFilenameFromUrl(*qn.ExplanationImageUrl))
			}
		}

		answerImages, err := dbw.Queries.GetQuizAnswerImages(ctx, quizUUID)
		if err != nil {
			return logAndReturnError(err)
		}
		for _, ansImgUrl := range answerImages {
			if ansImgUrl != nil {
				filesToDelete = append(filesToDelete, GetFilenameFromUrl(*ansImgUrl))
			}
		}

		// Delete quiz from DB
		err = dbw.Queries.DeleteQuizForUser(ctx, sqlc.DeleteQuizForUserParams{
			Uuid:          quizUUID,
			UserAccountID: userId,
		})
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
