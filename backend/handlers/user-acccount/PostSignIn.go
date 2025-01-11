package handlers

import (
	"context"
	"errors"
	"time"

	"github.com/swaggest/usecase"
	"golang.org/x/crypto/bcrypt"
)

var jwtSecret = []byte("your-secret-key") // Replace with a secure secret

func (dbw *DBWrapper) SignIn() usecase.Interactor {
	type request struct {
		Username string `json:"username" required:"true"`
		Password string `json:"password" required:"true"`
	}

	type response struct {
		AccessToken  string `json:"accessToken"`
		RefreshToken string `json:"refreshToken"`
	}

	return usecase.NewInteractor(func(ctx context.Context, input request, output *response) error {
		var user struct {
			ID           int64
			PasswordHash string
		}

		// Fetch user details
		err := dbw.DB.QueryRow(`
			SELECT id, password_hash
			FROM user_account
			WHERE username = $1
		`, input.Username).Scan(&user.ID, &user.PasswordHash)
		if err != nil {
			return errors.New("invalid username or password")
		}

		// Validate password
		err = bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(input.Password))
		if err != nil {
			return errors.New("invalid username or password")
		}

		// Generate access token
		accessToken, err := generateJWT(user.ID)
		if err != nil {
			return err
		}

		// Generate refresh token
		refreshToken := generateRefreshToken()
		_, err = dbw.DB.Exec(`
			INSERT INTO refresh_token (user_account_id, token, expires_at)
			VALUES ($1, $2, $3)
		`, user.ID, refreshToken, time.Now().Add(7*24*time.Hour)) // 7 days expiry
		if err != nil {
			return err
		}

		*output = response{
			AccessToken:  accessToken,
			RefreshToken: refreshToken,
		}
		return nil
	})
}
