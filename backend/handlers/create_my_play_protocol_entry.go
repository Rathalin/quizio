package handlers

import (
	"context"

	"github.com/Rathalin/quizio/backend/db/sqlc"
	"github.com/google/uuid"
	"github.com/swaggest/usecase"
	"github.com/swaggest/usecase/status"
)

func (dbw *DBWrapper) CreateMyPlayProtocolEntry() usecase.Interactor {
	type createPlayProtocolEntryWithUserRequest struct {
		QuizUuid string `json:"quizUuid" required:"true" validate:"required,uuid4"`
	}

	type createPlayProtocolEntryWithUserResponse struct{}

	return usecase.NewInteractor(func(ctx context.Context, input createPlayProtocolEntryWithUserRequest, output *createPlayProtocolEntryWithUserResponse) error {
		userId, err := getUserIdFromContext(ctx)
		if err != nil {
			return logAndReturnError(err)
		}

		if err := validate.Struct(input); err != nil {
			return status.Wrap(logAndReturnError(err), status.InvalidArgument)
		}

		quizUUID, err := uuid.Parse(input.QuizUuid)
		if err != nil {
			return logAndReturnError(err)
		}

		quizId, err := dbw.Queries.GetQuizIdByUuid(ctx, quizUUID)
		if err != nil {
			return logAndReturnError(err)
		}

		err = dbw.Queries.CreatePlayProtocolEntry(ctx, sqlc.CreatePlayProtocolEntryParams{
			QuizID:        quizId,
			UserAccountID: userId,
		})
		if err != nil {
			return logAndReturnError(err)
		}

		*output = createPlayProtocolEntryWithUserResponse{}
		return nil
	})
}

func (dbw *DBWrapper) CreatePublicPlayProtocolEntry() usecase.Interactor {
	type createPlayProtocolEntryRequest struct {
		QuizUuid string `json:"quizUuid" required:"true"`
	}

	type createPlayProtocolEntryResponse struct{}

	return usecase.NewInteractor(func(ctx context.Context, input createPlayProtocolEntryRequest, output *createPlayProtocolEntryResponse) error {
		quizUUID, err := uuid.Parse(input.QuizUuid)
		if err != nil {
			return logAndReturnError(err)
		}

		quizId, err := dbw.Queries.GetQuizIdByUuid(ctx, quizUUID)
		if err != nil {
			return logAndReturnError(err)
		}

		err = dbw.Queries.CreatePublicPlayProtocolEntry(ctx, quizId)
		if err != nil {
			return logAndReturnError(err)
		}

		*output = createPlayProtocolEntryResponse{}
		return nil
	})
}
