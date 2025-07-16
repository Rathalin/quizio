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
	"github.com/Rathalin/quizio/backend/middlewares"
)

func main() {
	env.Load()

	auth.Init(env.Config.JWTSecret)

	db.Connect()
	defer db.Close()

	dbWrapper := &handlers.DBWrapper{DB: db.DB}

	response.DefaultErrorResponseContentType = "application/problem+json"

	reflector := openapi3.NewReflector()
	service := web.NewService(reflector)

	service.OpenAPISchema().SetTitle("Quizzes API")
	service.OpenAPISchema().SetDescription("This service manages quizzes and their questions.")
	service.OpenAPISchema().SetVersion("v1.0.0")
	service.OpenAPISchema().SetHTTPBearerTokenSecurity("JWT token", "baerer", "")

	service.Use(
		cors.AllowAll().Handler,
	)

	// Public routes
	service.Group(func(router chi.Router) {
		router.Handle("/public/*", http.StripPrefix("/public/", http.FileServer(http.Dir("./public"))))

		router.Method(http.MethodPost, "/register", nethttp.NewHandler(dbWrapper.Register()))
		router.Method(http.MethodPost, "/refresh-token", nethttp.NewHandler(dbWrapper.RefreshToken()))
		router.Method(http.MethodPost, "/signin", nethttp.NewHandler(dbWrapper.SignIn()))
		router.Method(http.MethodGet, "/allowed-file-types", nethttp.NewHandler(dbWrapper.GetAllowedFileTypes()))
		router.Method(http.MethodGet, "/quizzes", nethttp.NewHandler(dbWrapper.GetQuizzes()))
		router.Method(http.MethodGet, "/play/{uuid}", nethttp.NewHandler(dbWrapper.PlayQuiz()))
		router.Method(http.MethodGet, "/user-profile/{uuid}", nethttp.NewHandler(dbWrapper.GetPublicUserProfile()))
		router.Method(http.MethodGet, "/alerts", nethttp.NewHandler(dbWrapper.GetAlerts()))
		router.Method(http.MethodPost, "/play-protocol-entry", nethttp.NewHandler((dbWrapper.CreatePlayProtocolEntry())))
	})

	// Auth routes
	service.Route("/user", func(router chi.Router) {
		router.With(
			nethttp.HTTPBearerSecurityMiddleware(service.OpenAPICollector, "JWT token", "baerer", "string"),
		).Group(func(router chi.Router) {
			router.Use(
				jwtauth.Verifier(auth.TokenAuth),
				jwtauth.Authenticator(auth.TokenAuth),
			)
			router.Method(http.MethodPost, "/upload", nethttp.NewHandler((dbWrapper.UploadFile())))
			router.Method(http.MethodDelete, "/upload", nethttp.NewHandler((dbWrapper.DeleteFile())))
			router.Method(http.MethodPost, "/signout", nethttp.NewHandler(dbWrapper.HandleSignOut()))
			router.Method(http.MethodGet, "/my-quizzes", nethttp.NewHandler((dbWrapper.GetMyQuizzes())))
			router.Method(http.MethodGet, "/quiz/{uuid}/trends", nethttp.NewHandler((dbWrapper.GetMyQuizTrends())))
			router.Method(http.MethodPost, "/quiz/create", nethttp.NewHandler((dbWrapper.CreateQuiz())))
			router.Method(http.MethodGet, "/quiz/{uuid}", nethttp.NewHandler(dbWrapper.GetQuiz()))
			router.Method(http.MethodPost, "/quiz/{uuid}", nethttp.NewHandler((dbWrapper.UpdateQuiz())))
			router.Method(http.MethodPost, "/quiz/{uuid}/visibility", nethttp.NewHandler((dbWrapper.UpdateQuizVisibility())))
			router.Method(http.MethodDelete, "/quiz/{uuid}", nethttp.NewHandler((dbWrapper.DeleteQuiz())))
			router.Method(http.MethodPost, "/play-protocol-entry", nethttp.NewHandler((dbWrapper.CreatePlayProtocolEntryWithUser())))
			router.Method(http.MethodGet, "/user-account", nethttp.NewHandler(dbWrapper.GetUserAccount()))
			router.Method(http.MethodGet, "/my-user-profile", nethttp.NewHandler(dbWrapper.GetMyUserProfile()))
			router.Method(http.MethodPost, "/change-password", nethttp.NewHandler(dbWrapper.ChangePassword()))
			router.Method(http.MethodPost, "/update-profile-image", nethttp.NewHandler(dbWrapper.UpdateUserProfileImage()))
		})
	})

	service.Route("/seo", func(router chi.Router) {
		router.With(nethttp.HTTPBearerSecurityMiddleware(service.OpenAPICollector, "SEO API Key", "baerer", "string")).Group(func(r chi.Router) {
			r.Use(middlewares.APIKeyMiddleware(env.Config.SEOAPIKey))
			r.Method(http.MethodGet, "/published-quizzes-uuids", nethttp.NewHandler(dbWrapper.PublishedQuizzesUuids()))
		})
	})

	docsAuth := middleware.BasicAuth("Docs Access", map[string]string{env.Config.OpenAPIDocsUser: env.Config.OpenAPIDocsPassword})
	docsSecuritySchema := nethttp.HTTPBasicSecurityMiddleware(service.OpenAPICollector, "Docs Access", "Basic authentication for accessing the OpenAPI docs")
	service.Route("/docs", func(r chi.Router) {
		r.Group(func(router chi.Router) {
			router.Use(docsAuth, docsSecuritySchema)
			if env.Config.GoEnv != "local" {
				router.Method(http.MethodGet, "/openapi.json", service.OpenAPICollector)
			}
			// Serve the Swagger UI
			router.Mount("/", v5emb.New(
				service.OpenAPISchema().Title(),
				"/docs/openapi.json",
				"/docs",
			))
		})
	})

	if env.Config.GoEnv == "local" {
		service.Method(http.MethodGet, "/docs/openapi.json", service.OpenAPICollector)
	}

	service.Route("/", func(r chi.Router) {
		r.Method(http.MethodGet, "/", http.RedirectHandler("/docs", http.StatusMovedPermanently))
	})

	log.Println("Starting service")
	if err := http.ListenAndServe("0.0.0.0:8080", service); err != nil {
		log.Fatal(err)
	}
}
