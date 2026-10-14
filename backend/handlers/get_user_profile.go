package handlers

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/swaggest/usecase"
	"github.com/swaggest/usecase/status"
)

func (dbw *DBWrapper) GetUserProfile() usecase.Interactor {
	type getPublicUserProfileRequest struct {
		UUID string `path:"uuid" required:"true" example:"9dfd2a83-b8be-4c35-90ec-0acda6df26d0"`
	}

	type getPublicUserProfileResponse struct {
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

	return usecase.NewInteractor(func(ctx context.Context, input getPublicUserProfileRequest, output *getPublicUserProfileResponse) error {
		if !isValidUUID(input.UUID) {
			return status.Wrap(logAndReturnErrorMessage("user does not exist (invalid uuid)"), status.NotFound)
		}

		if err := validate.Struct(input); err != nil {
			return status.Wrap(logAndReturnError(err), status.InvalidArgument)
		}

		userUUID, err := uuid.Parse(input.UUID)
		if err != nil {
			return status.Wrap(logAndReturnErrorMessage("user does not exist (invalid uuid)"), status.NotFound)
		}

		response := getPublicUserProfileResponse{}

		u, err := dbw.Queries.GetUserProfileByUuid(ctx, userUUID)
		if err != nil {
			return logAndReturnError(err)
		}

		createdCount, err := dbw.Queries.GetTotalQuizzesCreatedByUser(ctx, u.ID)
		if err != nil {
			return logAndReturnError(err)
		}

		playCount, err := dbw.Queries.GetTotalQuizzesPlayCountByUser(ctx, u.ID)
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
