package handlers

import (
	"context"
	"fmt"
	"os"
	"path/filepath"
	"strings"

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

		userUuid, err := dbw.GetUserUuid(ctx, userId)
		if err != nil {
			return logAndReturnError(err)
		}

		if input.ProfileImageUrl != nil {
			expectedPrefix := fmt.Sprintf("/public/uploads/%s/", userUuid)
			if !strings.HasPrefix(*input.ProfileImageUrl, expectedPrefix) {
				return status.Wrap(logAndReturnErrorMessage("invalid profile image URL"), status.InvalidArgument)
			}
			filename := strings.TrimPrefix(*input.ProfileImageUrl, expectedPrefix)
			if filename != filepath.Base(filename) {
				return status.Wrap(logAndReturnErrorMessage("invalid filename in profile image URL"), status.InvalidArgument)
			}

			root, err := os.OpenRoot(filepath.Join("public", "uploads", userUuid))
			if err != nil {
				return logAndReturnError(err)
			}
			defer root.Close()

			if _, err := root.Stat(filename); err != nil {
				if os.IsNotExist(err) {
					return status.Wrap(logAndReturnErrorMessage(fmt.Sprintf("file with url %s does not exist", *input.ProfileImageUrl)), status.FailedPrecondition)
				}
				return logAndReturnError(err)
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
