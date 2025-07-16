package handlers

import (
	"context"
	"fmt"
	"log"

	"github.com/swaggest/usecase"
	"github.com/swaggest/usecase/status"
)

func (dbw *DBWrapper) UpdateMyUserProfileImage() usecase.Interactor {
	type updateUserProfileImageRequest struct {
		ProfileImageUrl *string `json:"profileImageUrl" required:"true" nullable:"true"`
	}

	type updateUserProfileImageResponse struct{}

	return usecase.NewInteractor(func(ctx context.Context, input updateUserProfileImageRequest, output *updateUserProfileImageResponse) error {
		userId, err := getUserIdFromContext(ctx)
		if err != nil {
			return logAndReturnError(err)
		}

		if err := validate.Struct(input); err != nil {
			return status.Wrap(logAndReturnError(err), status.InvalidArgument)
		}

		if input.ProfileImageUrl != nil {
			log.Printf(".%v\n", *input.ProfileImageUrl)
			profileImageExists, err := fileExists(*input.ProfileImageUrl)
			if err != nil {
				return logAndReturnError(err)
			}
			if !profileImageExists {
				return status.Wrap(logAndReturnErrorMessage(fmt.Sprintf("file with url %s does not exist", *input.ProfileImageUrl)), status.FailedPrecondition)
			}
		}

		_, err = dbw.DB.ExecContext(ctx, `
			UPDATE user_account
			SET profile_image_url = $1
			WHERE id = $2
		`, input.ProfileImageUrl, userId)
		if err != nil {
			return logAndReturnError(err)
		}

		*output = updateUserProfileImageResponse{}
		return nil
	})
}
