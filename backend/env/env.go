package env

import (
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
)

type EnvVars struct {
	GoEnv               string
	JWTSecret           string
	PostgresDB          string
	PostgresHost        string
	PostgresUser        string
	PostgresPassword    string
	OpenAPIDocsUser     string
	OpenAPIDocsPassword string
	SEOAPIKey           string
}

var Vars *EnvVars

func Init() {
	env := os.Getenv("GO_ENV")
	if env == "" {
		env = "local"
	}

	envFile := fmt.Sprintf(".env.%s", env)
	// Check if the file exists
	if _, err := os.Stat(envFile); err == nil {
		err := godotenv.Load(envFile)
		if err != nil {
			log.Fatalf("Error loading %s file: %v", envFile, err)
		}
		log.Printf("Loaded environment variables from %s", envFile)
	} else {
		log.Printf("No .env.%s file found, relying on system environment variables", env)
	}

	// Access environment variables
	Vars = &EnvVars{
		GoEnv:               env,
		JWTSecret:           os.Getenv("JWT_SECRET"),
		PostgresDB:          os.Getenv("POSTGRES_DB"),
		PostgresHost:        os.Getenv("POSTGRES_HOST"),
		PostgresUser:        os.Getenv("POSTGRES_USER"),
		PostgresPassword:    os.Getenv("POSTGRES_PASSWORD"),
		OpenAPIDocsUser:     os.Getenv("OPENAPI_DOCS_USER"),
		OpenAPIDocsPassword: os.Getenv("OPENAPI_DOCS_PASSWORD"),
		SEOAPIKey:           os.Getenv("SEO_API_KEY"),
	}

	if Vars.JWTSecret == "" {
		log.Fatal("Environment variable JWT_SECRET is not set\n")
	}
	if Vars.PostgresDB == "" {
		log.Fatal("Environment variable POSTGRES_DB is not set\n")
	}
	if Vars.PostgresHost == "" {
		log.Fatal("Environment variable POSTGRES_HOST is not set\n")
	}
	if Vars.PostgresUser == "" {
		log.Fatal("Environment variable POSTGRES_USER is not set\n")
	}
	if Vars.PostgresPassword == "" {
		log.Fatal("Environment variable POSTGRES_PW is not set\n")
	}
	if Vars.OpenAPIDocsUser == "" {
		log.Fatal("Environment variable OPENAPI_DOCS_USER is not set\n")
	}
	if Vars.OpenAPIDocsPassword == "" {
		log.Fatal("Environment variable OPENAPI_DOCS_PASSWORD is not set\n")
	}
	if Vars.SEOAPIKey == "" {
		log.Fatal("Environment variable SEO_API_KEY is not set\n")
	}

	log.Printf("GO_ENV: %s\n", env)
	log.Printf("JWT_SECRET: %s\n", "(hidden)")
	log.Printf("POSTGRES_DB: %s\n", Vars.PostgresDB)
	log.Printf("POSTGRES_HOST: %s\n", Vars.PostgresHost)
	log.Printf("POSTGRES_USER: %s\n", Vars.PostgresUser)
	log.Printf("POSTGRES_PASSWORD: %s\n", "(hidden)")
	log.Printf("OPENAPI_DOCS_USER: %s\n", Vars.OpenAPIDocsUser)
	log.Printf("OPENAPI_DOCS_PASSWORD: %s\n", "(hidden)")
	log.Printf("SEO_API_KEY: %s\n", "(hidden)")
	log.Printf("\n")
}
