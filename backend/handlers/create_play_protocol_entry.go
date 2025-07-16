package handlers

import (
	"context"

	"github.com/swaggest/usecase"
	"github.com/swaggest/usecase/status"
)

func (dbw *DBWrapper) CreatePlayProtocolEntryWithUser() usecase.Interactor {
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

		quizId, err := dbw.GetQuizId(input.QuizUuid)
		if err != nil {
			return logAndReturnError(err)
		}

		_, err = dbw.DB.Exec(`
			INSERT INTO play_protocol_entry (quiz_id, user_account_id)
			VALUES ($1, $2)
		`, quizId, userId)
		if err != nil {
			return logAndReturnError(err)
		}

		*output = createPlayProtocolEntryWithUserResponse{}
		return nil
	})
}

func (dbw *DBWrapper) CreatePlayProtocolEntry() usecase.Interactor {
	type createPlayProtocolEntryRequest struct {
		QuizUuid string `json:"quizUuid" required:"true"`
	}

	type createPlayProtocolEntryResponse struct{}

	return usecase.NewInteractor(func(ctx context.Context, input createPlayProtocolEntryRequest, output *createPlayProtocolEntryResponse) error {
		quizId, err := dbw.GetQuizId(input.QuizUuid)
		if err != nil {
			return logAndReturnError(err)
		}

		_, err = dbw.DB.Exec(`
			INSERT INTO play_protocol_entry (quiz_id)
			VALUES ($1)
		`, quizId)
		if err != nil {
			return logAndReturnError(err)
		}

		*output = createPlayProtocolEntryResponse{}
		return nil
	})
}
