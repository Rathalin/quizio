package handlers

import (
	"errors"
	"log"
)

func checkNil(value *string) string {
	if value != nil {
		return *value
	}
	return "nil"
}

func logAndReturnError(message string) error {
	log.Println(message)
	return errors.New(message)
}
