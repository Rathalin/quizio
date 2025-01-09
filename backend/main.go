package main

import (
	"database/sql"
	"log"
	"net/http"

	_ "github.com/lib/pq"
	"github.com/rs/cors"
	"github.com/swaggest/openapi-go/openapi3"
	"github.com/swaggest/rest/web"
	"github.com/swaggest/swgui/v5emb"

	"quizio/backend/handlers"
)

var db *sql.DB

func connectDB() {
	var err error
	db, err = sql.Open("postgres", "host=localhost user=root password=mysecretpassword dbname=quizio sslmode=disable")
	if err != nil {
		log.Fatalf("Unable to connect to database: %v\n", err)
	}

	log.Println("Connected to PostgreSQL database.")
}

func closeDB() {
	if db != nil {
		db.Close()
	}
}

func main() {
	connectDB()
	defer closeDB()

	dbWrapper := &handlers.DBWrapper{DB: db}

	service := web.NewService(openapi3.NewReflector())

	service.OpenAPISchema().SetTitle("Quizzes API")
	service.OpenAPISchema().SetDescription("This service manages quizzes and their questions.")
	service.OpenAPISchema().SetVersion("v1.0.0")

	service.Use(
		cors.AllowAll().Handler,
	)

	service.Get("/quizzes", dbWrapper.GetQuizzes())
	service.Get("/quizzes/uuids", dbWrapper.GetQuizzesUuids())
	service.Post("/quizzes", dbWrapper.PostQuiz())

	service.Docs("/docs", v5emb.New)

	log.Println("Starting service")
	if err := http.ListenAndServe("localhost:8080", service); err != nil {
		log.Fatal(err)
	}
}
