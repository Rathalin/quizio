package handlers

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"log"
	"os"
	"path/filepath"

	"github.com/swaggest/usecase"
)

func (dbw *DBWrapper) UploadFile() usecase.Interactor {
	type uploadFileRequest struct {
		Filename string `json:"filename" required:"true"`
		File     []byte `json:"file" required:"true" nullable:"false"`
	}

	type uploadFileResponse struct {
		URL string `json:"url" required:"true"`
	}

	return usecase.NewInteractor(func(ctx context.Context, input uploadFileRequest, output *uploadFileResponse) error {
		userId, err := getUserIdFromContext(ctx)
		if err != nil {
			return logAndReturnError(err.Error())
		}

		userUuid, err := dbw.GetUserUuid(userId)
		if err != nil {
			return logAndReturnError(err.Error())
		}

		// Define the upload directory
		pathDir := fmt.Sprintf("/public/uploads/%v/", userUuid)
		uploadDir := fmt.Sprintf(".%v", pathDir)
		if err := os.MkdirAll(uploadDir, os.ModePerm); err != nil {
			return fmt.Errorf("unable to create upload directory: %w", err)
		}

		// Generate a unique file name if the file already exists
		originalFilePath := filepath.Join(uploadDir, input.Filename)
		filePath := originalFilePath
		ext := filepath.Ext(input.Filename)
		name := input.Filename[:len(input.Filename)-len(ext)]
		counter := 1

		for {
			if _, err := os.Stat(filePath); os.IsNotExist(err) {
				break // File does not exist, use this filePath
			}
			// File exists, generate a new name
			name = fmt.Sprintf("%s_%d%s", name, counter, ext)
			filePath = filepath.Join(uploadDir, name)
			counter++
		}

		// Save the file
		out, err := os.Create(filePath)
		if err != nil {
			return fmt.Errorf("failed to create file: %w", err)
		}
		defer out.Close()

		_, err = io.Copy(out, bytes.NewReader(input.File))
		if err != nil {
			return fmt.Errorf("failed to write file to disk: %w", err)
		}

		// Generate the file URL (adjust this to your server's public URL)
		fileURL := fmt.Sprintf("%s%s", pathDir, filepath.Base(filePath))

		log.Printf("Uploaded image %v for user %v -> %v\n", input.Filename, userUuid, fileURL)

		// Populate the response
		*output = uploadFileResponse{
			URL: fileURL,
		}

		return nil
	})
}
