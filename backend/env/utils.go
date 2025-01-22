package env

import (
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
)

type EnvVars struct {
	DBName     string
	DBHost     string
	DBUser     string
	DBPassword string
	JWTSecret  string
}

var Vars *EnvVars

func InitiEnvironmentVariables() {
	env := os.Getenv("GO_ENV")
	if env == "" {
		env = "local"
	}

	// Load the appropriate .env file
	envFile := fmt.Sprintf(".env.%s", env)
	err := godotenv.Load(envFile)
	if err != nil {
		log.Fatalf("Error loading %s file: %v", envFile, err)
	}

	// Access environment variables
	Vars = &EnvVars{
		DBName:     os.Getenv("POSTGRES_DB"),
		DBHost:     os.Getenv("POSTGRES_HOST"),
		DBUser:     os.Getenv("POSTGRES_USER"),
		DBPassword: os.Getenv("POSTGRES_PW"),
		JWTSecret:  os.Getenv("JWT_SECRET"),
	}

	if Vars.DBName == "" {
		log.Fatal("Environment variable POSTGRES_DB is not set\n")
	}
	if Vars.DBHost == "" {
		log.Fatal("Environment variable POSTGRES_HOST is not set\n")
	}
	if Vars.DBUser == "" {
		log.Fatal("Environment variable POSTGRES_USER is not set\n")
	}
	if Vars.DBPassword == "" {
		log.Fatal("Environment variable POSTGRES_PW is not set\n")
	}
	if Vars.JWTSecret == "" {
		log.Fatal("Environment variable JWT_SECRET is not set\n")
	}

	fmt.Printf("Database: %s\n", Vars.DBName)
	fmt.Printf("Host: %s\n", Vars.DBHost)
	fmt.Printf("User: %s\n", Vars.DBUser)
	fmt.Printf("Password: %s\n", "(hidden)")
	fmt.Printf("JWT Secret: %s\n", Vars.JWTSecret)
}
