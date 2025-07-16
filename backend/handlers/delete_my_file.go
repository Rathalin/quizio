package handlers

import (
	"context"
	"fmt"
	"log"
	"os"

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

		filePath := GetFilePaths(input.Filename, userUuid).filePath

		// Check if the file exists
		if _, err := os.Stat(filePath); os.IsNotExist(err) {
			*output = deleteFileResponse{
				Message: fmt.Sprintf("file does not exist: %v", input.Filename),
			}
		} else {
			// Delete the file
			if err := os.Remove(filePath); err != nil {
				return fmt.Errorf("failed to delete file: %w", err)
			}

			log.Printf("Deleted file %v for user %v\n", input.Filename, userUuid)
		}

		*output = deleteFileResponse{
			Message: fmt.Sprintf("File %v successfully deleted.", input.Filename),
		}

		return nil
	})
}
