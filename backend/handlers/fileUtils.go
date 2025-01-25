package handlers

import (
	"fmt"
	"log"
	"os"
	"path"
	"path/filepath"
)

type paths struct {
	uploadDir string
	filePath  string
}

func GetFilePaths(fileName string, userUuid string) paths {
	// Define the directory for the user's files
	uploadDir := fmt.Sprintf("./public/uploads/%v/", userUuid)
	filePath := filepath.Join(uploadDir, fileName)

	// Define the directory for the user's files
	return paths{
		uploadDir,
		filePath,
	}
}

func GetFilenameFromUrl(fileUrl string) string {
	return path.Base(fileUrl)
}

func DeleteFile(filename string, userUuid string) bool {
	paths := GetFilePaths(filename, userUuid)

	// Check if the file exists
	if _, err := os.Stat(paths.filePath); os.IsNotExist(err) {
		return false
	} else {
		// Delete the file
		if err := os.Remove(paths.filePath); err != nil {
			log.Printf("failed to delete file: %s", err.Error())
			return false
		}

		log.Printf("Deleted file %v for user %v\n", filename, userUuid)
		return true
	}
}
