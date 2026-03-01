package handlers

import (
	"context"
	"strings"
	"time"

	"github.com/swaggest/usecase"
	"github.com/swaggest/usecase/status"
	"golang.org/x/crypto/bcrypt"
)

func (dbw *DBWrapper) SignIn() usecase.Interactor {
	type signInRequest struct {
		Username string `json:"username" required:"true"`
		Password string `json:"password" required:"true"`
	}

	type signInResponse struct {
		UserUUID     string `json:"uuid" required:"true"`
		AccessToken  string `json:"accessToken" required:"true"`
		RefreshToken string `json:"refreshToken" required:"true"`
		HasPasskeys  bool   `json:"hasPasskeys" required:"true"`
	}

	return usecase.NewInteractor(func(ctx context.Context, input signInRequest, output *signInResponse) error {
		if err := validate.Struct(input); err != nil {
			return status.Wrap(logAndReturnError(err), status.InvalidArgument)
		}

		trimmedUsername := strings.TrimSpace(input.Username)

		usernameExists, err := dbw.UsernameExists(trimmedUsername)
		if err != nil {
			return logAndReturnError(err)
		}

		unauthenticatedMessage := "invalid username or password"

		if !usernameExists {
			return status.Wrap(logAndReturnErrorMessage(unauthenticatedMessage), status.Unauthenticated)
		}

		response := signInResponse{}

		var row struct {
			ID           int64
			PasswordHash string
		}
		// Fetch user details
		err = dbw.DB.QueryRow(`
			SELECT id, password_hash, uuid
			FROM user_account
			WHERE username = $1
		`, trimmedUsername).Scan(
			&row.ID,
			&row.PasswordHash,
			&response.UserUUID,
		)
		if err != nil {
			return logAndReturnError(err)
		}

		passkeysCount := 0
		err = dbw.DB.QueryRow(`
			SELECT COUNT(*)
			FROM passkey
			WHERE user_account_id = $1
		`, row.ID).Scan(&passkeysCount)
		if err != nil {
			return logAndReturnError(err)
		}
		response.HasPasskeys = passkeysCount > 0

		// Validate password
		err = bcrypt.CompareHashAndPassword([]byte(row.PasswordHash), []byte(input.Password))
		if err != nil {
			return status.Wrap(logAndReturnErrorMessage(unauthenticatedMessage), status.Unauthenticated)
		}

		// Generate access token
		accessToken, err := generateJWT(row.ID)
		if err != nil {
			return logAndReturnError(err)
		}

		// Generate refresh token
		refreshToken, err := generateRefreshToken(row.ID)
		if err != nil {
			return logAndReturnError(err)
		}

		_, err = dbw.DB.Exec(`
			INSERT INTO refresh_token (user_account_id, token, expires_at)
			VALUES ($1, $2, $3)
		`, row.ID, refreshToken, time.Now().Add(7*24*time.Hour)) // 7 days expiry
		if err != nil {
			return logAndReturnError(err)
		}

		response.AccessToken = accessToken
		response.RefreshToken = refreshToken

		*output = response
		return nil
	})
}
