package db

import (
	"database/sql"
	"fmt"
	"log"
	"quizio/backend/env"
)

var DB *sql.DB

func ConnectDB() {
	var err error
	DB, err = sql.Open("postgres", fmt.Sprintf("host=%s user=%s password=%s dbname=%s sslmode=disable", env.Vars.DBHost, env.Vars.DBUser, env.Vars.DBPassword, env.Vars.DBName))
	if err != nil {
		log.Fatalf("Unable to connect to database: %v\n", err)
	}
	log.Println("Connected to PostgreSQL database.")
}

func CloseDB() {
	if DB != nil {
		DB.Close()
	}
}
