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
		uploadDir := "./uploads/"
		if err := os.MkdirAll(uploadDir, os.ModePerm); err != nil {
			return fmt.Errorf("unable to create upload directory: %w", err)
		}

		fmt.Printf("Uploaded image %v (%v)", input.Filename, len(input.File))

		// Save the file
		filePath := filepath.Join(uploadDir, input.Filename)
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
		fileURL := fmt.Sprintf("/uploads/%s", input.Filename)

		// Populate the response
		*output = uploadFileResponse{
			URL: fileURL,
		}

		return nil
	})
}
