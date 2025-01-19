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

func (dbw *DBWrapper) UploadImage() usecase.Interactor {
	type uploadImageRequest struct {
		Filename string `json:"filename" required:"true"`
		File     []byte `json:"file" required:"true" nullable:"false"`
	}

	type uploadImageResponse struct {
		URL string `json:"url" required:"true"`
	}

	return usecase.NewInteractor(func(ctx context.Context, input uploadImageRequest, output *uploadImageResponse) error {

		// Define the upload directory
		uploadDir := "./uploads/"
		if err := os.MkdirAll(uploadDir, os.ModePerm); err != nil {
			return fmt.Errorf("unable to create upload directory: %w", err)
		}

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
		*output = uploadImageResponse{
			URL: fileURL,
		}

		return nil
	})
}
