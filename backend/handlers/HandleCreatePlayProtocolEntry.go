package handlers

import (
	"context"

	"github.com/swaggest/usecase"
)

func (dbw *DBWrapper) HandleCreatePlayProtocolEntry() usecase.Interactor {
	type createPlayProtocolEntryRequest struct {
		QuizUuid string  `json:"quizUuid" required:"true"`
		UserUuid *string `json:"userUuid"`
	}

	type createPlayProtocolEntryResponse struct{}

	return usecase.NewInteractor(func(ctx context.Context, input createPlayProtocolEntryRequest, output *createPlayProtocolEntryResponse) error {
		var quizId string
		var userId *string

		err := dbw.DB.QueryRow(`
			SELECT id
			FROM quiz
			WHERE uuid = $1
		`, input.QuizUuid).Scan(&quizId)
		if err != nil {
			return logAndReturnError(err)
		}

		if input.UserUuid != nil {
			err = dbw.DB.QueryRow(`
			SELECT id
			FROM user_account
			WHERE uuid = $1
		`, input.UserUuid).Scan(&userId)
			if err != nil {
				return logAndReturnError(err)
			}
		}

		_, err = dbw.DB.Exec(`
			INSERT INTO play_protocol_entry (quiz_id, user_account_id)
			VALUES ($1, $2)
		`, quizId, userId)
		if err != nil {
			return logAndReturnError(err)
		}

		*output = createPlayProtocolEntryResponse{}
		return nil
	})
}
