package handlers

import (
	"context"
	"time"

	"github.com/swaggest/usecase"
)

func (dbw *DBWrapper) HandleGetMyUserProfile() usecase.Interactor {
	type getMyUserProfileRequest struct{}

	type getMyUserProfileResponse struct {
		User struct {
			UUID            string    `json:"uuid" required:"true"`
			CreatedAt       time.Time `json:"createdAt" required:"true"`
			Username        string    `json:"username" required:"true"`
			ProfileImageUrl *string   `json:"profileImageUrl" required:"true" nullable:"true"`
		} `json:"user" required:"true"`
		QuizStats struct {
			TotalQuizzesCreated   int `json:"totalQuizzesCreated" required:"true"`
			TotalQuizzesPlayCount int `json:"totalQuizzesPlayCount" required:"true"`
		} `json:"quizStats" required:"true"`
	}

	return usecase.NewInteractor(func(ctx context.Context, input getMyUserProfileRequest, output *getMyUserProfileResponse) error {
		userId, err := getUserIdFromContext(ctx)
		if err != nil {
			return logAndReturnError(err)
		}

		response := getMyUserProfileResponse{}

		err = dbw.DB.QueryRow(`
			SELECT uuid, created_at, username, profile_image_url
			FROM user_account
			WHERE id = $1
		`, userId).Scan(&response.User.UUID, &response.User.CreatedAt, &response.User.Username, &response.User.ProfileImageUrl)
		if err != nil {
			return logAndReturnError(err)
		}

		err = dbw.DB.QueryRow(`
			SELECT COUNT(*)
			FROM quiz
			WHERE user_account_id = $1
		`, userId).Scan(&response.QuizStats.TotalQuizzesCreated)
		if err != nil {
			return logAndReturnError(err)
		}

		err = dbw.DB.QueryRow(`
			SELECT COUNT(*)
			FROM play_protocol_entry
			WHERE user_account_id = $1
		`, userId).Scan(&response.QuizStats.TotalQuizzesPlayCount)
		if err != nil {
			return logAndReturnError(err)
		}

		*output = response
		return nil
	})
}
