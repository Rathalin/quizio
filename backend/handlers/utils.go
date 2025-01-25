package handlers

import (
	"errors"
	"fmt"
	"log"
	"os"
)

func logAndReturnError(err error) error {
	log.Println(err.Error())
	return err
}

func logAndReturnErrorMessage(message string) error {
	log.Println(message)
	return errors.New(message)
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
