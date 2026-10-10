package handlers

import (
	"database/sql"
	"errors"
	"fmt"
	"os"

	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
	"github.com/lib/pq"
	"github.com/rs/zerolog/log"
	"github.com/swaggest/usecase/status"
)

func logAndReturnError(err error) error {
	reqID := uuid.New().String()
	log.Error().Err(err).Str("req_id", reqID).Send()

	if err == nil {
		return nil
	}

	if errors.Is(err, sql.ErrNoRows) {
		return status.Wrap(errors.New("not found"), status.NotFound)
	}

	var valErrs validator.ValidationErrors
	if errors.As(err, &valErrs) {
		return status.Wrap(errors.New("validation failed"), status.InvalidArgument)
	}

	var pqErr *pq.Error
	if errors.As(err, &pqErr) {
		if pqErr.Code == "22P02" {
			return status.Wrap(errors.New("invalid uuid format"), status.InvalidArgument)
		}
	}

	return status.Wrap(fmt.Errorf("internal server error (req: %s)", reqID), status.Internal)
}

func logAndReturnErrorMessage(message string) error {
	log.Error().Msg(message)
	return status.Wrap(errors.New(message), status.InvalidArgument)
}

type TypedError struct {
	Message   string
	ErrorType string
}

func (e *TypedError) Error() string {
	return e.Message
}

func (e *TypedError) Fields() map[string]any {
	return map[string]any{
		"error_type": e.ErrorType,
	}
}

func logAndReturnTypedError(message, errorType string) error {
	log.Error().Str("error_type", errorType).Msg(message)
	return &TypedError{
		Message:   message,
		ErrorType: errorType,
	}
}

func fileExists(filePath string) (bool, error) {
	// Convert to relative path by adding "."
	_, err := os.Stat(fmt.Sprintf(".%s", filePath))
	if err == nil {
		// The file exists
		return true, nil
	}
	if os.IsNotExist(err) {
		// The file does not exist
		return false, nil
	}
	// Some other error occurred (e.g., permission issues)
	return false, err
}
