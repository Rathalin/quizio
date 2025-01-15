package handlers

import (
	"context"
	"errors"
	"time"

	"github.com/swaggest/usecase"
	"github.com/swaggest/usecase/status"
)

func (dbw *DBWrapper) GetUserProfile() usecase.Interactor {
	type getUserProfileRequest struct {
		UUID string `path:"uuid" required:"true" example:"9dfd2a83-b8be-4c35-90ec-0acda6df26d0"`
	}

	type getUserProfileResponse struct {
		User struct {
			UUID            string    `json:"uuid" required:"true"`
			CreatedAt       time.Time `json:"createdAt" required:"true"`
			Username        string    `json:"username" required:"true"`
			ProfileImageUrl *string   `json:"profileImageUrl,omitempty"`
		} `json:"user" required:"true"`
		QuizStats struct {
			TotalQuizzesCreated   int `json:"totalQuizzesCreated" required:"true"`
			TotalQuizzesPlayCount int `json:"totalQuizzesPlayCount" required:"true"`
		} `json:"quizStats" required:"true"`
	}

	return usecase.NewInteractor(func(ctx context.Context, input getUserProfileRequest, output *getUserProfileResponse) error {
		userExists, err := dbw.userExists(input.UUID)
		if err != nil {
			return err
		}
		if !userExists {
			return status.Wrap(errors.New("user does not exists"), status.NotFound)
		}

		userId, err := dbw.getUserId(input.UUID)
		if err != nil {
			return err
		}

		response := getUserProfileResponse{}

		err = dbw.DB.QueryRow(`
			SELECT uuid, created_at, username, profile_image_url
			FROM user_account
			WHERE id = $1
		`, userId).Scan(&response.User.UUID, &response.User.CreatedAt, &response.User.Username, &response.User.ProfileImageUrl)
		if err != nil {
			return err
		}

		err = dbw.DB.QueryRow(`
			SELECT COUNT(*)
			FROM quiz
			WHERE user_account_id = $1
		`, userId).Scan(&response.QuizStats.TotalQuizzesCreated)
		if err != nil {
			return err
		}

		err = dbw.DB.QueryRow(`
			SELECT COUNT(*)
			FROM play_protocol_entry
			WHERE user_account_id = $1
		`, userId).Scan(&response.QuizStats.TotalQuizzesPlayCount)
		if err != nil {
			return err
		}

		*output = response
		return nil
	})
}
