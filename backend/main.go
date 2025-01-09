package main

import (
	"context"
	"log"
	"net/http"

	"github.com/jackc/pgx"
	"github.com/rs/cors"
	"github.com/swaggest/openapi-go/openapi3"
	"github.com/swaggest/rest/nethttp"
	"github.com/swaggest/rest/web"
	"github.com/swaggest/swgui/v5emb"
	"github.com/swaggest/usecase"

	"quizio/backend/models"
)

var db *pgx.Conn

func connectDB() {
	var err error
	db, err = pgx.Connect(pgx.ConnConfig{
		Host:     "localhost",
		Port:     5432,
		Database: "quizio",
		User:     "root",
		Password: "mysecretpassword",
	})
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

func getQuizzes() usecase.Interactor {
	return usecase.NewInteractor(func(_ context.Context, _ struct{}, output *[]models.Quiz) error {
		rows, err := db.Query(`
			SELECT id, uuid, title, description, is_published, play_count 
			FROM quizzes
		`)
		if err != nil {
			return err
		}
		defer rows.Close()

		var quizzes []models.Quiz
		for rows.Next() {
			var quiz models.Quiz
			if err := rows.Scan(&quiz.ID, &quiz.UUID, &quiz.Title, &quiz.Description, &quiz.IsPublished, &quiz.PlayCount); err != nil {
				return err
			}
			quizzes = append(quizzes, quiz)
		}
		*output = quizzes
		return nil
	})
}

func getQuizzesUuids() usecase.Interactor {
	return usecase.NewInteractor(func(_ context.Context, _ struct{}, output *[]string) error {
		rows, err := db.Query(`
			SELECT uuid
			FROM quizzes
		`)
		if err != nil {
			return err
		}
		defer rows.Close()

		var uuids []string
		for rows.Next() {
			var uuid string
			if err := rows.Scan(&uuid); err != nil {
				return err
			}
			uuids = append(uuids, uuid)
		}
		*output = uuids
		return nil
	})
}

func postQuiz() usecase.Interactor {
	return usecase.NewInteractor(func(ctx context.Context, input models.Quiz, output *models.Quiz) error {
		_, err := db.Exec(`
			INSERT INTO quizzes (id, title, description, is_published, play_count) 
			VALUES ($1, $2, $3, $4, $5)
		`,
			input.ID, input.Title, input.Description, input.IsPublished, input.PlayCount,
		)
		if err != nil {
			return err
		}

		*output = input
		return nil
	})
}

func main() {
	connectDB()
	defer closeDB()

	service := web.NewService(openapi3.NewReflector())

	service.OpenAPISchema().SetTitle("Quizzes API")
	service.OpenAPISchema().SetDescription("This service manages quizzes and their questions.")
	service.OpenAPISchema().SetVersion("v1.0.0")

	service.Use(
		cors.AllowAll().Handler, // "github.com/rs/cors", 3rd-party CORS middleware can also be configured here.
	)

	service.Get("/quizzes", getQuizzes())
	service.Get("/quizzes/uuids", getQuizzesUuids())
	service.Post("/quizzes", postQuiz(), nethttp.SuccessStatus(http.StatusCreated))

	service.Docs("/docs", v5emb.New)

	log.Println("Starting service")
	if err := http.ListenAndServe("localhost:8080", service); err != nil {
		log.Fatal(err)
	}
}
