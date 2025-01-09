package main

import (
	"log"
	"net/http"

	"quizio/backend/handlers"
	"quizio/backend/models"

	"github.com/gorilla/mux"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"

	_ "quizio/backend/docs"

	httpSwagger "github.com/swaggo/http-swagger"
)

// @title Quizio API
// @version 1.0
// @description This is a sample server for Quizio.
// @host localhost:8080
// @BasePath /

var db *gorm.DB

func initDd() {
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

func seedDb() {
	// Check if the database already has data
	var count int64
	db.Model(&models.Quiz{}).Count(&count)
	if count > 0 {
		log.Println("Database already seeded")
		return
	}

	// Create a quiz
	quiz := models.Quiz{
		Title:       "Sample Quiz",
		Description: "This is an example quiz for testing purposes.",
		IsPublished: new(bool),
		Questions: []models.Question{
			{
				Title:       "What is the capital of France?",
				Description: "Choose the correct answer",
				Explanation: "The capital of France is Paris.",
				Answers: []models.Answer{
					{Title: "Paris", IsCorrect: true},
					{Title: "London", IsCorrect: false},
					{Title: "Berlin", IsCorrect: false},
					{Title: "Madrid", IsCorrect: false},
				},
			},
			{
				Title:       "What is 2 + 2?",
				Description: "Choose the correct answer",
				Explanation: "2 + 2 equals 4.",
				Answers: []models.Answer{
					{Title: "3", IsCorrect: false},
					{Title: "4", IsCorrect: true},
					{Title: "5", IsCorrect: false},
					{Title: "6", IsCorrect: false},
				},
			},
			{
				Title:       "Which planet is known as the Red Planet?",
				Description: "Choose the correct answer",
				Explanation: "Mars is known as the Red Planet.",
				Answers: []models.Answer{
					{Title: "Earth", IsCorrect: false},
					{Title: "Mars", IsCorrect: true},
					{Title: "Venus", IsCorrect: false},
					{Title: "Jupiter", IsCorrect: false},
				},
			},
		},
	}

	// Insert the quiz into the database
	if err := db.Create(&quiz).Error; err != nil {
		log.Fatalf("Failed to seed database: %v", err)
	}

	log.Println("Database seeded successfully")
}

func main() {
	initDd()
	seedDb()

	// Create a new router
	r := mux.NewRouter()

	// Initialize handlers
	quizHandler := handlers.NewQuizHandler(db)

	// Define routes
	// r.HandleFunc("/quiz/{uuid}", quizHandler.GetQuizByUUID).Methods("GET")
	r.HandleFunc("/quizzes", quizHandler.GetAllQuizzes).Methods("GET") // New route for fetching all quizzes

	// Swagger endpoint
	r.PathPrefix("/swagger/").Handler(httpSwagger.WrapHandler)

	// Start the server
	log.Println("Server running on http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", r))
}
