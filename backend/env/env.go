package env

import (
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
)

type EnvVars struct {
	JWTSecret           string
	PostgresDB          string
	PostgresHost        string
	PostgresUser        string
	PostgresPassword    string
	OpenAPIDocsUser     string
	OpenAPIDocsPassword string
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
		JWTSecret:           os.Getenv("JWT_SECRET"),
		PostgresDB:          os.Getenv("POSTGRES_DB"),
		PostgresHost:        os.Getenv("POSTGRES_HOST"),
		PostgresUser:        os.Getenv("POSTGRES_USER"),
		PostgresPassword:    os.Getenv("POSTGRES_PASSWORD"),
		OpenAPIDocsUser:     os.Getenv("OPENAPI_DOCS_USER"),
		OpenAPIDocsPassword: os.Getenv("OPENAPI_DOCS_PASSWORD"),
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

	log.Printf("Database: %s\n", Vars.PostgresDB)
	log.Printf("Host: %s\n", Vars.PostgresHost)
	log.Printf("User: %s\n", Vars.PostgresUser)
	log.Printf("Password: %s\n", "(hidden)")
	log.Printf("JWT Secret: %s\n", "(hidden)")
	log.Printf("\n")
}
