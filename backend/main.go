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

	auth.Init(env.Config.JWTSecret, env.Config.WebAuthnRPDisplayName, env.Config.WebAuthnRPID, env.Config.WebAuthnRPOrigin)

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
		router.Method(http.MethodPost, "/sign-in", nethttp.NewHandler(dbWrapper.SignIn()))
		router.Method(http.MethodPost, "/refresh-token", nethttp.NewHandler(dbWrapper.RefreshToken()))
		router.Method(http.MethodGet, "/user/{uuid}/profile", nethttp.NewHandler(dbWrapper.GetUserProfile()))
		router.Method(http.MethodGet, "/alerts", nethttp.NewHandler(dbWrapper.GetAlerts()))
		router.Method(http.MethodPost, "/create-play-protocol-entry", nethttp.NewHandler((dbWrapper.CreatePublicPlayProtocolEntry())))
		router.Method(http.MethodPost, "/auth/passkeys/login/start", nethttp.NewHandler(dbWrapper.StartPasskeyLogin()))
		router.Method(http.MethodPost, "/auth/passkeys/login/finish", http.HandlerFunc(dbWrapper.FinishPasskeyLogin))

		router.Route("/quizzes", func(router chi.Router) {
			router.Method(http.MethodGet, "/", nethttp.NewHandler(dbWrapper.GetQuizzes()))
			router.Method(http.MethodGet, "/{uuid}", nethttp.NewHandler(dbWrapper.GetQuiz()))
		})
	})

	// Auth routes
	service.Route("/me", func(router chi.Router) {
		router.With(
			nethttp.HTTPBearerSecurityMiddleware(service.OpenAPICollector, "JWT token", "baerer", "string"),
		).Group(func(router chi.Router) {
			router.Use(
				jwtauth.Verifier(auth.TokenAuth),
				jwtauth.Authenticator(auth.TokenAuth),
			)

			router.Method(http.MethodPost, "/signout", nethttp.NewHandler(dbWrapper.SignOut()))
			router.Method(http.MethodGet, "/account", nethttp.NewHandler(dbWrapper.GetMyAccount()))
			router.Method(http.MethodGet, "/profile", nethttp.NewHandler(dbWrapper.GetMyUserProfile()))
			router.Method(http.MethodPost, "/change-password", nethttp.NewHandler(dbWrapper.ChangeMyPassword()))
			router.Method(http.MethodPost, "/update-image", nethttp.NewHandler(dbWrapper.UpdateMyUserProfileImage()))
			router.Method(http.MethodPost, "/create-play-protocol-entry", nethttp.NewHandler((dbWrapper.CreateMyPlayProtocolEntry())))
			
			router.Route("/auth/passkeys/register", func(router chi.Router) {
				router.Method(http.MethodGet, "/start", nethttp.NewHandler(dbWrapper.StartPasskeyRegistration()))
				router.Method(http.MethodPost, "/finish", http.HandlerFunc(dbWrapper.FinishPasskeyRegistration))
			})

			router.Route("/upload", func(router chi.Router) {
				router.Method(http.MethodPost, "/", nethttp.NewHandler((dbWrapper.UploadMyFile())))
				router.Method(http.MethodDelete, "/", nethttp.NewHandler((dbWrapper.DeleteMyFile())))
			})

			router.Route("/quizzes", func(router chi.Router) {
				router.Method(http.MethodGet, "/", nethttp.NewHandler((dbWrapper.GetMyQuizzes())))
				router.Method(http.MethodPost, "/create", nethttp.NewHandler((dbWrapper.CreateMyQuiz())))
				router.Method(http.MethodGet, "/{uuid}", nethttp.NewHandler(dbWrapper.GetMyQuiz()))
				router.Method(http.MethodPost, "/{uuid}", nethttp.NewHandler((dbWrapper.UpdateMyQuiz())))
				router.Method(http.MethodDelete, "/{uuid}", nethttp.NewHandler((dbWrapper.DeleteMyQuiz())))
				router.Method(http.MethodPost, "/{uuid}/visibility", nethttp.NewHandler((dbWrapper.UpdateMyQuizVisibility())))
				router.Method(http.MethodGet, "/{uuid}/trends", nethttp.NewHandler((dbWrapper.GetMyQuizTrends())))
				router.Method(http.MethodGet, "/allowed-file-types", nethttp.NewHandler(dbWrapper.GetMyQuizzesAllowedFileTypes()))
			})
		})
	})

	service.Route("/seo", func(router chi.Router) {
		router.With(nethttp.HTTPBearerSecurityMiddleware(service.OpenAPICollector, "SEO API Key", "baerer", "string")).Group(func(r chi.Router) {
			r.Use(middlewares.APIKeyMiddleware(env.Config.SEOAPIKey))
			r.Method(http.MethodGet, "/published-quizzes-uuids", nethttp.NewHandler(dbWrapper.GetSeoPublishedQuizzesUuids()))
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
