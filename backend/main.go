package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

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
		fs := http.FileServer(middlewares.NeuteredFileSystem{FS: http.Dir("./public")})
		router.Handle("/public/*", http.StripPrefix("/public/", fs))

		router.Method(http.MethodPost, "/register", nethttp.NewHandler(dbWrapper.Register()))
		router.Method(http.MethodPost, "/sign-in", nethttp.NewHandler(dbWrapper.SignIn()))
		router.Method(http.MethodPost, "/refresh-token", nethttp.NewHandler(dbWrapper.RefreshToken()))
		router.Method(http.MethodGet, "/user/{uuid}/profile", nethttp.NewHandler(dbWrapper.GetUserProfile()))
		router.Method(http.MethodGet, "/alerts", nethttp.NewHandler(dbWrapper.GetAlerts()))
		router.Method(http.MethodPost, "/create-play-protocol-entry", nethttp.NewHandler((dbWrapper.CreatePublicPlayProtocolEntry())))

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
				middlewares.RequireAccessToken,
			)

			router.Method(http.MethodPost, "/signout", nethttp.NewHandler(dbWrapper.SignOut()))
			router.Method(http.MethodGet, "/account", nethttp.NewHandler(dbWrapper.GetMyAccount()))
			router.Method(http.MethodGet, "/profile", nethttp.NewHandler(dbWrapper.GetMyUserProfile()))
			router.Method(http.MethodPost, "/change-password", nethttp.NewHandler(dbWrapper.ChangeMyPassword()))
			router.Method(http.MethodPost, "/update-image", nethttp.NewHandler(dbWrapper.UpdateMyUserProfileImage()))
			router.Method(http.MethodPost, "/create-play-protocol-entry", nethttp.NewHandler((dbWrapper.CreateMyPlayProtocolEntry())))

			router.Route("/upload", func(router chi.Router) {
				router.Use(func(next http.Handler) http.Handler {
					return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
						r.Body = http.MaxBytesReader(w, r.Body, 10*1024*1024) // 10MB max request size
						next.ServeHTTP(w, r)
					})
				})
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

	// OAuth routes
	service.Route("/oauth", func(router chi.Router) {
		router.Method(http.MethodGet, "/authorize", dbWrapper.OAuthAuthorizeHandler())
		router.Method(http.MethodPost, "/token", nethttp.NewHandler(dbWrapper.OAuthToken()))

		// Dynamic Client Registration (RFC 7591)
		router.Method(http.MethodPost, "/register", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			var req map[string]any
			if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
				http.Error(w, err.Error(), http.StatusBadRequest)
				return
			}
			var clientID string
			if uris, ok := req["redirect_uris"].([]any); ok && len(uris) > 0 {
				claims := map[string]any{"redirect_uris": uris}
				if name, ok := req["client_name"].(string); ok {
					claims["client_name"] = name
				}
				_, tokenString, err := auth.TokenAuth.Encode(claims)
				if err == nil {
					clientID = tokenString
				}
			}
			if clientID == "" {
				clientID = "dynamic-client-id-" + r.RemoteAddr
			}

			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusCreated)
			json.NewEncoder(w).Encode(map[string]any{
				"client_id":     clientID,
				"redirect_uris": req["redirect_uris"],
			})
		}))

		// /oauth/grant requires authentication
		router.With(
			nethttp.HTTPBearerSecurityMiddleware(service.OpenAPICollector, "JWT token", "baerer", "string"),
		).Group(func(r chi.Router) {
			r.Use(
				jwtauth.Verifier(auth.TokenAuth),
				jwtauth.Authenticator(auth.TokenAuth),
				middlewares.RequireAccessToken,
			)
			r.Method(http.MethodPost, "/grant", nethttp.NewHandler(dbWrapper.OAuthGrant()))
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

	mcpServer := setupMCPServer()

	mcpAuthMiddleware := func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			token := jwtauth.TokenFromHeader(r)
			if token == "" {
				w.Header().Set("WWW-Authenticate", fmt.Sprintf(`Bearer resource_metadata="%s/.well-known/oauth-protected-resource"`, env.Config.APIURL))
				http.Error(w, "Unauthorized", http.StatusUnauthorized)
				return
			}
			next.ServeHTTP(w, r)
		})
	}

	service.Mount("/mcp", mcpAuthMiddleware(mcpServer))
	service.Method(http.MethodGet, "/.well-known/oauth-protected-resource/mcp", mcpServer)

	service.Route("/.well-known", func(router chi.Router) {
		router.Method(http.MethodGet, "/oauth-authorization-server", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(map[string]any{
				"issuer":                           env.Config.APIURL,
				"authorization_endpoint":           env.Config.APIURL + "/oauth/authorize",
				"token_endpoint":                   env.Config.APIURL + "/oauth/token",
				"registration_endpoint":            env.Config.APIURL + "/oauth/register",
				"code_challenge_methods_supported": []string{"S256"},
			})
		}))

		router.Method(http.MethodGet, "/oauth-protected-resource", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(map[string]any{
				"resource":              env.Config.APIURL + "/mcp",
				"authorization_servers": []string{env.Config.APIURL},
			})
		}))
	})

	service.Route("/", func(r chi.Router) {
		r.Method(http.MethodGet, "/", http.RedirectHandler("/docs", http.StatusMovedPermanently))
	})

	srv := &http.Server{
		Addr:         "0.0.0.0:8080",
		Handler:      service,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 30 * time.Second,
		IdleTimeout:  120 * time.Second,
	}

	go func() {
		log.Println("Starting service on port 8080")
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("listen: %s\n", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt, syscall.SIGTERM)
	<-quit
	log.Println("Shutting down server...")

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		log.Fatal("Server forced to shutdown:", err)
	}

	log.Println("Server exiting")
}
