package handlers

import (
	"fmt"
	"log"
	"os"
	"path"
	"path/filepath"
	"strings"
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
	if filename != filepath.Base(filename) {
		log.Printf("failed to delete file: invalid filename %s", filename)
		return false
	}

	uploadDir := filepath.Join("public", "uploads", userUuid)
	root, err := os.OpenRoot(uploadDir)
	if err != nil {
		if os.IsNotExist(err) {
			return false
		}
		log.Printf("failed to delete file (OpenRoot): %v", err)
		return false
	}
	defer root.Close()

	if err := root.Remove(filename); err != nil {
		if !os.IsNotExist(err) {
			log.Printf("failed to delete file: %v", err)
		}
		return false
	}

	log.Printf("Deleted file %v for user %v\n", filename, userUuid)
	return true
}

var AllowedImageTypes = []string{
	"jpg",
	"jpeg",
	"png",
	"webp",
	"svg",
	"gif",
	"avif",
}
var AllowedAudioTypes = []string{
	"mp3",
	"acc",
	"ogg",
	"wav",
	"flac",
	"m4a",
}
var AllowedFileTypes = append(AllowedImageTypes, AllowedAudioTypes...)

func GetFileExtension(filename string) string {
	ext := filepath.Ext(filename)
	if len(ext) > 0 {
		return strings.TrimPrefix(ext, ".") // Remove the leading dot
	}
	return ""
}
