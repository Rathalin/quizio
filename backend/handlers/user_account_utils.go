package handlers

import "context"

func (dbw *DBWrapper) UsernameExists(ctx context.Context, username string) (bool, error) {
	usernameCount := 0
	err := dbw.DB.QueryRowContext(ctx, `
		SELECT COUNT(*)
		FROM user_account
		WHERE LOWER(username) = LOWER($1)
	`, username).Scan(&usernameCount)
	if err != nil {
		return false, err
	}

	return usernameCount > 0, nil
}
func (dbw *DBWrapper) GetUserUuid(ctx context.Context, id int64) (string, error) {
	var userUuid string
	err := dbw.DB.QueryRowContext(ctx, `
		SELECT uuid
		FROM user_account
		WHERE id = $1
	`, id).Scan(&userUuid)
	if err != nil {
		return userUuid, err
	}

	return userUuid, nil
}
