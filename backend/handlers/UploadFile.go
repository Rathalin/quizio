package handlers

import (
	"bytes"
	"context"
	"fmt"
	"io"
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
		// Define the upload directory
		uploadDir := "./public/uploads/"
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
			filePath = filepath.Join(uploadDir, fmt.Sprintf("%s_%d%s", name, counter, ext))
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
		fileURL := fmt.Sprintf("/public/uploads/%s", filepath.Base(filePath))

		fmt.Printf("Uploaded image %v (%v) -> %v\n", input.Filename, len(input.File), fileURL)

		// Populate the response
		*output = uploadFileResponse{
			URL: fileURL,
		}

		return nil
	})
}
