package main

import (
	"log"
	"net/http"

	_ "github.com/lib/pq"

	"github.com/go-chi/chi/v5"
	jwtauth "github.com/go-chi/jwtauth/v5"
	"github.com/rs/cors"
	"github.com/swaggest/openapi-go/openapi3"
	"github.com/swaggest/rest/nethttp"
	"github.com/swaggest/rest/response"
	"github.com/swaggest/rest/web"
	"github.com/swaggest/swgui/v5emb"

	"quizio/backend/auth"
	"quizio/backend/db"
	"quizio/backend/env"
	"quizio/backend/handlers"
)

func main() {
	env.InitiEnvironmentVariables()

	db.ConnectDB()
	defer db.CloseDB()

	dbWrapper := &handlers.DBWrapper{DB: db.DB}

	response.DefaultErrorResponseContentType = "application/problem+json"

	r := openapi3.NewReflector()
	s := web.NewService(r)

	s.OpenAPISchema().SetTitle("Quizzes API")
	s.OpenAPISchema().SetDescription("This service manages quizzes and their questions.")
	s.OpenAPISchema().SetVersion("v1.0.0")
	s.OpenAPISchema().SetHTTPBearerTokenSecurity("JWT token", "baerer", "")

	s.Use(
		cors.AllowAll().Handler,
	)

	// Public routes
	s.Group(func(r chi.Router) {
		r.Handle("/public/*", http.StripPrefix("/public/", http.FileServer(http.Dir("./public"))))
		r.Method(http.MethodPost, "/register", nethttp.NewHandler(dbWrapper.Register()))
		r.Method(http.MethodPost, "/signin", nethttp.NewHandler(dbWrapper.SignIn()))
		r.Method(http.MethodGet, "/quizzes", nethttp.NewHandler(dbWrapper.GetQuizzes()))
		r.Method(http.MethodGet, "/play/{uuid}", nethttp.NewHandler(dbWrapper.PlayQuiz()))
		r.Method(http.MethodGet, "/user-profile/{uuid}", nethttp.NewHandler(dbWrapper.GetUserProfile()))
		r.Method(http.MethodGet, "/alerts", nethttp.NewHandler(dbWrapper.GetAlerts()))
		r.Method(http.MethodPost, "/refresh-token", nethttp.NewHandler(dbWrapper.RefreshToken()))
	})

	// Auth routes
	s.Route("/a", func(r chi.Router) {
		r.With(
			nethttp.HTTPBearerSecurityMiddleware(s.OpenAPICollector, "JWT token", "baerer", "format idk"),
		).Group(func(r chi.Router) {
			r.Use(
				jwtauth.Verifier(auth.TokenAuth),
				jwtauth.Authenticator(auth.TokenAuth),
			)
			r.Method(http.MethodPost, "/upload", nethttp.NewHandler((dbWrapper.UploadFile())))
			r.Method(http.MethodDelete, "/upload", nethttp.NewHandler((dbWrapper.DeleteFile())))
			r.Method(http.MethodPost, "/signout", nethttp.NewHandler(dbWrapper.SignOut()))
			r.Method(http.MethodPost, "/quiz/create", nethttp.NewHandler((dbWrapper.CreateQuiz())))
			r.Method(http.MethodGet, "/quiz/{uuid}", nethttp.NewHandler(dbWrapper.GetQuiz()))
			r.Method(http.MethodPost, "/quiz/{uuid}", nethttp.NewHandler((dbWrapper.EditQuiz())))
			r.Method(http.MethodDelete, "/quiz/{uuid}", nethttp.NewHandler((dbWrapper.DeleteQuiz())))
			r.Method(http.MethodPost, "/play-protocol-entry", nethttp.NewHandler((dbWrapper.PostPlayProtocolEntry())))
			r.Method(http.MethodGet, "/me", nethttp.NewHandler(dbWrapper.GetMyUserProfile()))
			r.Method(http.MethodPost, "/change-password", nethttp.NewHandler(dbWrapper.ChangePassword()))

			r.Method(http.MethodGet, "/debug", nethttp.NewHandler(dbWrapper.Debug()))
		})
	})

	s.Docs("/docs", v5emb.New)

	log.Println("Starting service")
	if err := http.ListenAndServe("localhost:8080", s); err != nil {
		log.Fatal(err)
	}
}
