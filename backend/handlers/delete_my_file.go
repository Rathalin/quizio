package handlers

import (
	"context"
	"fmt"
	"log"
	"os"
	"path/filepath"

	"github.com/swaggest/usecase"
	"github.com/swaggest/usecase/status"
)

func (dbw *DBWrapper) DeleteMyFile() usecase.Interactor {
	type deleteFileRequest struct {
		Filename string `query:"filename" required:"true" validate:"required,min=1"`
	}

	type deleteFileResponse struct {
		Message string `json:"message" required:"true"`
	}

	return usecase.NewInteractor(func(ctx context.Context, input deleteFileRequest, output *deleteFileResponse) error {
		userId, err := getUserIdFromContext(ctx)
		if err != nil {
			return logAndReturnError(err)
		}

		if err := validate.Struct(input); err != nil {
			return status.Wrap(logAndReturnError(err), status.InvalidArgument)
		}

		userUuid, err := dbw.GetUserUuid(userId)
		if err != nil {
			return logAndReturnError(err)
		}

		if input.Filename != filepath.Base(input.Filename) {
			return status.Wrap(fmt.Errorf("invalid filename"), status.InvalidArgument)
		}

		uploadDir := filepath.Join("public", "uploads", userUuid)
		root, err := os.OpenRoot(uploadDir)
		if err != nil {
			if os.IsNotExist(err) {
				*output = deleteFileResponse{
					Message: fmt.Sprintf("file does not exist: %v", input.Filename),
				}
				return nil
			}
			return logAndReturnError(err)
		}
		defer root.Close()

		if err := root.Remove(input.Filename); err != nil {
			if os.IsNotExist(err) {
				*output = deleteFileResponse{
					Message: fmt.Sprintf("file does not exist: %v", input.Filename),
				}
				return nil
			}
			return fmt.Errorf("failed to delete file: %w", err)
		}

		log.Printf("Deleted file %v for user %v\n", input.Filename, userUuid)

		*output = deleteFileResponse{
			Message: fmt.Sprintf("File %v successfully deleted.", input.Filename),
		}

		return nil
	})
}
