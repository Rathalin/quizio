package handlers

import (
	"context"

	"github.com/swaggest/usecase"
)

func (dbw *DBWrapper) PostPlayProtocolEntry() usecase.Interactor {
	type request struct {
		QuizUuid string  `json:"quizUuid" required:"true"`
		UserUuid *string `json:"userUuid"`
	}

	type response struct{}

	return usecase.NewInteractor(func(ctx context.Context, input request, output *response) error {
		var quizId string
		var userId *string
		println("Input: ", input.QuizUuid, input.UserUuid)

		err := dbw.DB.QueryRow(`
			SELECT id
			FROM quiz
			WHERE uuid = $1
		`, input.QuizUuid).Scan(&quizId)
		if err != nil {
			return err
		}
		if input.UserUuid != nil {
			err = dbw.DB.QueryRow(`
			SELECT id
			FROM user_account
			WHERE uuid = $1
		`, input.UserUuid).Scan(&userId)
			if err != nil {
				return err
			}
		}
		println("IDs", quizId, userId)
		_, err = dbw.DB.Exec(`
			INSERT INTO play_protocol_entry (quiz_id, user_account_id)
			VALUES ($1, $2)
		`, quizId, userId)
		if err != nil {
			return err
		}

		response := response{}
		*output = response
		return nil
	})
}
