package middlewares

import (
	"net/http"
	"os"
)

type NeuteredFileSystem struct {
	FS http.FileSystem
}

// Disable directory listing
func (nfs NeuteredFileSystem) Open(path string) (http.File, error) {
	f, err := nfs.FS.Open(path)
	if err != nil {
		return nil, err
	}

	s, err := f.Stat()
	if err != nil {
		return nil, err
	}
	if s.IsDir() {
		return nil, os.ErrNotExist
	}

	return f, nil
}
