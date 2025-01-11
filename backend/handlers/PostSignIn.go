package handlers

import (
	"context"
	"errors"
	"quizio/backend/models"
	"time"

	"github.com/swaggest/usecase"
	"golang.org/x/crypto/bcrypt"
)

var jwtSecret = []byte("your-secret-key") // Replace with a secure secret

func (dbw *DBWrapper) SignIn() usecase.Interactor {
	type signInRequest struct {
		Username string `json:"username" required:"true"`
		Password string `json:"password" required:"true"`
	}

	type signInResponse struct {
		User         models.UserAccount `json:"user" required:"true"`
		AccessToken  string             `json:"accessToken" required:"true"`
		RefreshToken string             `json:"refreshToken" required:"true"`
	}

	return usecase.NewInteractor(func(ctx context.Context, input signInRequest, output *signInResponse) error {
		var row struct {
			ID           int64
			PasswordHash string
		}

		response := signInResponse{}
		// Fetch user details
		err := dbw.DB.QueryRow(`
			SELECT id, password_hash, uuid, created_at, updated_at, username, is_confirmed, is_blocked, profile_image_url
			FROM user_account
			WHERE username = $1
		`, input.Username).Scan(
			&row.ID,
			&row.PasswordHash,
			&response.User.UUID,
			&response.User.CreatedAt,
			&response.User.UpdatedAt,
			&response.User.Username,
			&response.User.IsConfirmed,
			&response.User.IsBlocked,
			&response.User.ProfileImageUrl,
		)
		if err != nil {
			println(err.Error())
			return errors.New("invalid username or password")
		}

		// Validate password
		err = bcrypt.CompareHashAndPassword([]byte(row.PasswordHash), []byte(input.Password))
		if err != nil {
			return errors.New("invalid username or password")
		}

		// Generate access token
		accessToken, err := generateJWT(row.ID)
		if err != nil {
			return err
		}

		// Generate refresh token
		refreshToken := generateRefreshToken()
		_, err = dbw.DB.Exec(`
			INSERT INTO refresh_token (user_account_id, token, expires_at)
			VALUES ($1, $2, $3)
		`, row.ID, refreshToken, time.Now().Add(7*24*time.Hour)) // 7 days expiry
		if err != nil {
			return err
		}

		response.AccessToken = accessToken
		response.RefreshToken = refreshToken

		*output = response
		return nil
	})
}
