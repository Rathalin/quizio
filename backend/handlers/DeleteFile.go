package handlers

import (
	"context"
	"fmt"
	"log"
	"os"
	"path/filepath"

	"github.com/swaggest/usecase"
)

func (dbw *DBWrapper) DeleteFile() usecase.Interactor {
	type deleteFileRequest struct {
		Filename string `query:"filename" required:"true"`
	}

	type deleteFileResponse struct {
		Message string `json:"message" required:"true"`
	}

	return usecase.NewInteractor(func(ctx context.Context, input deleteFileRequest, output *deleteFileResponse) error {
		userId, err := getUserIdFromContext(ctx)
		if err != nil {
			return logAndReturnError(err)
		}

		userUuid, err := dbw.GetUserUuid(userId)
		if err != nil {
			return logAndReturnError(err)
		}

		// Define the directory for the user's files
		uploadDir := fmt.Sprintf("./public/uploads/%v/", userUuid)
		filePath := filepath.Join(uploadDir, input.Filename)

		// Check if the file exists
		if _, err := os.Stat(filePath); os.IsNotExist(err) {
			return fmt.Errorf("file does not exist: %v", input.Filename)
		}

		// Delete the file
		if err := os.Remove(filePath); err != nil {
			return fmt.Errorf("failed to delete file: %w", err)
		}

		log.Printf("Deleted file %v for user %v\n", input.Filename, userUuid)

		*output = deleteFileResponse{
			Message: fmt.Sprintf("File %v successfully deleted.", input.Filename),
		}

		return nil
	})
}
