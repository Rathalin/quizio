package handlers

import (
	"context"
	"time"

	"github.com/swaggest/usecase"
	"github.com/swaggest/usecase/status"
)

func (dbw *DBWrapper) GetMyUserProfile() usecase.Interactor {
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

		if err := validate.Struct(input); err != nil {
			return status.Wrap(logAndReturnError(err), status.InvalidArgument)
		}

		response := getMyUserProfileResponse{}

		u, err := dbw.Queries.GetUserProfileById(ctx, userId)
		if err != nil {
			return logAndReturnError(err)
		}

		createdCount, err := dbw.Queries.GetTotalQuizzesCreatedByUser(ctx, userId)
		if err != nil {
			return logAndReturnError(err)
		}

		playCount, err := dbw.Queries.GetTotalQuizzesPlayCountByUser(ctx, userId)
		if err != nil {
			return logAndReturnError(err)
		}

		response.User.UUID = u.Uuid.String()
		response.User.CreatedAt = u.CreatedAt
		response.User.Username = u.Username
		response.User.ProfileImageUrl = u.ProfileImageUrl
		response.QuizStats.TotalQuizzesCreated = int(createdCount)
		response.QuizStats.TotalQuizzesPlayCount = int(playCount)

		*output = response
		return nil
	})
}
