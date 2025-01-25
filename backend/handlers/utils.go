package handlers

import (
	"errors"
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
	_, err := os.Stat(filePath)
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
