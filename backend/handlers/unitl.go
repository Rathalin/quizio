package handlers

import (
	"database/sql"
)

type DBWrapper struct {
	DB *sql.DB
}
