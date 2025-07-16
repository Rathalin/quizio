package db

import (
	"database/sql"
	"fmt"
	"log"

	"github.com/Rathalin/quizio/backend/env"
)

var DB *sql.DB

func Connect() {
	var err error
	DB, err = sql.Open("postgres", fmt.Sprintf("host=%s user=%s password=%s dbname=%s sslmode=disable", env.Config.PostgresHost, env.Config.PostgresUser, env.Config.PostgresPassword, env.Config.PostgresDB))
	if err != nil {
		log.Fatalf("Unable to connect to database: %v\n", err)
	}

	// Test the connection
	if err = DB.Ping(); err != nil {
		log.Fatalf("Unable to establish a connection to the database: %v\n", err)
	}
	log.Println("Connected to PostgreSQL database.")
}

func Close() {
	if DB != nil {
		DB.Close()
	}
}
