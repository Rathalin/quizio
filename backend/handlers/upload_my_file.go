package handlers

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"log"
	"os"
	"path/filepath"
	"slices"
	"strings"

	"github.com/gabriel-vasile/mimetype"
	"github.com/google/uuid"
	"github.com/swaggest/usecase"
	"github.com/swaggest/usecase/status"
)

func (dbw *DBWrapper) UploadMyFile() usecase.Interactor {
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
			return logAndReturnError(err)
		}

		if err := validate.Struct(input); err != nil {
			return status.Wrap(logAndReturnError(err), status.InvalidArgument)
		}

		userUuid, err := dbw.GetUserUuid(userId)
		if err != nil {
			return logAndReturnError(err)
		}

		if !slices.Contains(AllowedFileTypes, strings.ToLower(GetFileExtension(input.Filename))) {
			return status.Wrap(fmt.Errorf("invalid file type"), status.InvalidArgument)
		}

		mtype := mimetype.Detect(input.File)

		// Explicitly reject SVGs even if they bypass the extension check (e.g. named .jpg)
		if mtype.Is("image/svg+xml") || mtype.Is("text/xml") || mtype.Is("application/xml") {
			return status.Wrap(fmt.Errorf("svg uploads are not allowed"), status.InvalidArgument)
		}

		if !strings.HasPrefix(mtype.String(), "image/") && !strings.HasPrefix(mtype.String(), "audio/") {
			return status.Wrap(fmt.Errorf("invalid file content type: %s", mtype.String()), status.InvalidArgument)
		}

		const maxUploadSize = 5 * 1024 * 1024 // 5MB
		const maxUserQuota = 50 * 1024 * 1024 // 50MB

		if len(input.File) > maxUploadSize {
			return status.Wrap(fmt.Errorf("file size exceeds maximum allowed size of 5MB"), status.InvalidArgument)
		}

		uploadDir := filepath.Join("public", "uploads", userUuid)

		currentDirSize, err := getDirSize(uploadDir)
		if err != nil {
			return logAndReturnError(fmt.Errorf("failed to calculate current user quota: %w", err))
		}

		if currentDirSize+int64(len(input.File)) > maxUserQuota {
			return status.Wrap(fmt.Errorf("upload would exceed the maximum user quota of 50MB"), status.InvalidArgument)
		}

		// Define the upload directory
		pathDir := fmt.Sprintf("/public/uploads/%v/", userUuid)
		if err := os.MkdirAll(uploadDir, 0o755); err != nil {
			return logAndReturnError(fmt.Errorf("unable to create upload directory: %w", err))
		}

		root, err := os.OpenRoot(uploadDir)
		if err != nil {
			return logAndReturnError(fmt.Errorf("unable to open upload directory: %w", err))
		}
		defer root.Close()

		ext := strings.ToLower(filepath.Ext(input.Filename))
		name := uuid.NewString() + ext

		// Save the file securely and exclusively
		out, err := root.OpenFile(name, os.O_WRONLY|os.O_CREATE|os.O_EXCL, 0o644)
		if err != nil {
			return logAndReturnError(fmt.Errorf("failed to create file: %w", err))
		}
		defer out.Close()

		_, err = io.Copy(out, bytes.NewReader(input.File))
		if err != nil {
			return logAndReturnError(fmt.Errorf("failed to write file to disk: %w", err))
		}

		// Generate the file URL (adjust this to your server's public URL)
		fileURL := fmt.Sprintf("%s%s", pathDir, name)

		log.Printf("Uploaded image %v for user %v -> %v\n", input.Filename, userUuid, fileURL)

		// Populate the response
		*output = uploadFileResponse{
			URL: fileURL,
		}

		return nil
	})
}
