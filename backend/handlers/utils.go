package handlers

import (
	"errors"
	"fmt"
	"os"

	"github.com/rs/zerolog/log"
)

func logAndReturnError(err error) error {
	log.Error().Err(err).Send()
	return err
}

func logAndReturnErrorMessage(message string) error {
	log.Error().Msg(message)
	return errors.New(message)
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
