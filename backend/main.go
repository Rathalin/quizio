package main

import (
	"log"
	"net/http"

	"quizio/backend/handlers"
	"quizio/backend/models"

	"github.com/gorilla/mux"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var db *gorm.DB

func initDB() {
	// Database connection string
	dsn := "host=localhost user=root password=mysecretpassword dbname=quizio port=5432 sslmode=disable TimeZone=Europe/Vienna"

	// Connect to the database
	var err error
	db, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	// Auto-migrate the tables
	err = db.AutoMigrate(&models.Quiz{}, &models.Question{}, &models.Answer{})
	if err != nil {
		log.Fatalf("Failed to migrate database: %v", err)
	}
}

func main() {
	// Initialize the database
	initDB()

	// Create a new router
	r := mux.NewRouter()

	// Initialize handlers
	quizHandler := handlers.NewQuizHandler(db)

	// Define routes
	r.HandleFunc("/quiz/{uuid}", quizHandler.GetQuizByUUID).Methods("GET")

	// Start the server
	log.Println("Server running on http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", r))
}
