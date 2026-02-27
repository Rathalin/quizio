package handlers

import (
	"github.com/Rathalin/quizio/backend/models"
	"github.com/go-webauthn/webauthn/webauthn"
)

func (dbw *DBWrapper) UserExists(uuid string) (bool, error) {
	userCount := 0
	err := dbw.DB.QueryRow(`
		SELECT COUNT(*)
		FROM user_account
		WHERE uuid = $1
	`, uuid).Scan(&userCount)
	if err != nil {
		return false, err
	}

	return userCount > 0, nil
}

func (dbw *DBWrapper) UsernameExists(username string) (bool, error) {
	usernameCount := 0
	err := dbw.DB.QueryRow(`
		SELECT COUNT(*)
		FROM user_account
		WHERE username = $1
	`, username).Scan(&usernameCount)
	if err != nil {
		return false, err
	}

	return usernameCount > 0, nil
}

func (dbw *DBWrapper) GetUserId(uuid string) (int64, error) {
	var userId int64
	err := dbw.DB.QueryRow(`
		SELECT id
		FROM user_account
		WHERE uuid = $1
	`, uuid).Scan(&userId)
	if err != nil {
		return userId, err
	}

	return userId, nil
}

func (dbw *DBWrapper) GetUserUuid(id int64) (string, error) {
	var userUuid string
	err := dbw.DB.QueryRow(`
		SELECT uuid
		FROM user_account
		WHERE id = $1
	`, id).Scan(&userUuid)
	if err != nil {
		return userUuid, err
	}

	return userUuid, nil
}

func (dbw *DBWrapper) getUserAccountByUUID(uuid string) (*models.UserAccount, error) {
	var user models.UserAccount
	var id int64
	err := dbw.DB.QueryRow(`
		SELECT id, uuid, created_at, updated_at, username, is_confirmed, is_blocked, profile_image_url
		FROM user_account
		WHERE uuid = $1
	`, uuid).Scan(&id, &user.UUID, &user.CreatedAt, &user.UpdatedAt, &user.Username, &user.IsConfirmed, &user.IsBlocked, &user.ProfileImageUrl)
	if err != nil {
		return nil, err
	}

	creds, err := dbw.getWebAuthnCredentialsForUser(id)
	if err != nil {
		return nil, err
	}
	user.AddPasskeyCredentials(creds)

	return &user, nil
}

func (dbw *DBWrapper) getUserAccountByUsername(username string) (*models.UserAccount, error) {
	var user models.UserAccount
	var id int64
	err := dbw.DB.QueryRow(`
		SELECT id, uuid, created_at, updated_at, username, is_confirmed, is_blocked, profile_image_url
		FROM user_account
		WHERE username = $1
	`, username).Scan(&id, &user.UUID, &user.CreatedAt, &user.UpdatedAt, &user.Username, &user.IsConfirmed, &user.IsBlocked, &user.ProfileImageUrl)
	if err != nil {
		return nil, err
	}

	creds, err := dbw.getWebAuthnCredentialsForUser(id)
	if err != nil {
		return nil, err
	}
	user.AddPasskeyCredentials(creds)

	return &user, nil
}

func (dbw *DBWrapper) getWebAuthnCredentialsForUser(userAccountId int64) ([]webauthn.Credential, error) {
	rows, err := dbw.DB.Query(`
		SELECT id, credential_id, public_key, sign_count, created_at, updated_at
		FROM passkey
		WHERE user_account_id = $1
	`, userAccountId)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var credentials []webauthn.Credential
	for rows.Next() {
		var passkey models.UserPasskey
		err := rows.Scan(&passkey.ID, &passkey.CredentialID, &passkey.PublicKey, &passkey.SignCount, &passkey.CreatedAt, &passkey.UpdatedAt)
		if err != nil {
			return nil, err
		}
		credentials = append(credentials, passkey.ToWebAuthnCredential())
	}
	if err = rows.Err(); err != nil {
		return nil, err
	}

	return credentials, nil
}
