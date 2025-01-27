package main

import (
	"log"
	"net/http"

	_ "github.com/lib/pq"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	jwtauth "github.com/go-chi/jwtauth/v5"
	"github.com/rs/cors"
	"github.com/swaggest/openapi-go/openapi3"
	"github.com/swaggest/rest/nethttp"
	"github.com/swaggest/rest/response"
	"github.com/swaggest/rest/web"
	"github.com/swaggest/swgui/v5emb"

	"github.com/Rathalin/quizio/backend/auth"
	"github.com/Rathalin/quizio/backend/db"
	"github.com/Rathalin/quizio/backend/env"
	"github.com/Rathalin/quizio/backend/handlers"
)

func main() {
	env.Init()

	auth.InitTokenAuth(env.Vars.JWTSecret)

	db.Connect()
	defer db.Close()

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
		r.Method(http.MethodPost, "/register", nethttp.NewHandler(dbWrapper.HandleRegister()))
		r.Method(http.MethodPost, "/refresh-token", nethttp.NewHandler(dbWrapper.HandleRefreshToken()))
		r.Method(http.MethodPost, "/signin", nethttp.NewHandler(dbWrapper.HandleSignIn()))
		r.Method(http.MethodGet, "/quizzes", nethttp.NewHandler(dbWrapper.HandleGetQuizzes()))
		r.Method(http.MethodGet, "/play/{uuid}", nethttp.NewHandler(dbWrapper.HandleHandlePlayQuiz()))
		r.Method(http.MethodGet, "/user-profile/{uuid}", nethttp.NewHandler(dbWrapper.HandleGetUserProfile()))
		r.Method(http.MethodGet, "/alerts", nethttp.NewHandler(dbWrapper.HandleGetAlerts()))
		r.Method(http.MethodPost, "/play-protocol-entry", nethttp.NewHandler((dbWrapper.HandleCreatePlayProtocolEntry())))
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
			r.Method(http.MethodPost, "/upload", nethttp.NewHandler((dbWrapper.HandleUploadFile())))
			r.Method(http.MethodDelete, "/upload", nethttp.NewHandler((dbWrapper.HandleDeleteFile())))
			r.Method(http.MethodPost, "/signout", nethttp.NewHandler(dbWrapper.HandleSignOut()))
			r.Method(http.MethodPost, "/quiz/create", nethttp.NewHandler((dbWrapper.HandleCreateQuiz())))
			r.Method(http.MethodGet, "/quiz/{uuid}", nethttp.NewHandler(dbWrapper.HandleGetQuiz()))
			r.Method(http.MethodPost, "/quiz/{uuid}", nethttp.NewHandler((dbWrapper.HandleUpdateQuiz())))
			r.Method(http.MethodDelete, "/quiz/{uuid}", nethttp.NewHandler((dbWrapper.HandleDeleteQuiz())))
			r.Method(http.MethodPost, "/play-protocol-entry", nethttp.NewHandler((dbWrapper.HandleCreatePlayProtocolEntryWithUser())))
			r.Method(http.MethodGet, "/me", nethttp.NewHandler(dbWrapper.HandleGetMyUserProfile()))
			r.Method(http.MethodPost, "/change-password", nethttp.NewHandler(dbWrapper.HandleChangePassword()))
			r.Method(http.MethodPost, "/update-profile-image", nethttp.NewHandler(dbWrapper.HandleUpdateUserProfileImage()))

			r.Method(http.MethodGet, "/debug", nethttp.NewHandler(dbWrapper.HandleDebug()))
		})
	})

	docsAuth := middleware.BasicAuth("Docs Access", map[string]string{env.Vars.OpenAPIDocsUser: env.Vars.OpenAPIDocsPassword})
	docsSecuritySchema := nethttp.HTTPBasicSecurityMiddleware(s.OpenAPICollector, "Docs Access", "Basic authentication for accessing the OpenAPI docs")
	s.Route("/docs", func(r chi.Router) {
		r.Group(func(r chi.Router) {
			r.Use(docsAuth, docsSecuritySchema)
			if env.Vars.GoEnv != "local" {
				r.Method(http.MethodGet, "/openapi.json", s.OpenAPICollector)
			}
			// Serve the Swagger UI
			r.Mount("/", v5emb.New(
				s.OpenAPISchema().Title(),
				"/docs/openapi.json",
				"/docs",
			))
		})
	})

	if env.Vars.GoEnv == "local" {
		s.Method(http.MethodGet, "/docs/openapi.json", s.OpenAPICollector)
	}

	s.Route("/", func(r chi.Router) {
		r.Method(http.MethodGet, "/", http.RedirectHandler("/docs", http.StatusMovedPermanently))
	})

	log.Println("Starting service")
	if err := http.ListenAndServe("0.0.0.0:8080", s); err != nil {
		log.Fatal(err)
	}
}
