package handlers

import (
	"context"

	"github.com/swaggest/usecase"
)

func (dbw *DBWrapper) HandleCreatePlayProtocolEntryWithUser() usecase.Interactor {
	type createPlayProtocolEntryWithUserRequest struct {
		QuizUuid string `json:"quizUuid" required:"true"`
	}

	type createPlayProtocolEntryWithUserResponse struct{}

	return usecase.NewInteractor(func(ctx context.Context, input createPlayProtocolEntryWithUserRequest, output *createPlayProtocolEntryWithUserResponse) error {
		userId, err := getUserIdFromContext(ctx)
		if err != nil {
			return logAndReturnError(err)
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

func (dbw *DBWrapper) HandleCreatePlayProtocolEntry() usecase.Interactor {
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
