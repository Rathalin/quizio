package handlers

import "context"

func (dbw *DBWrapper) UsernameExists(ctx context.Context, username string) (bool, error) {
	return dbw.Queries.UsernameExists(ctx, username)
}

func (dbw *DBWrapper) GetUserUuid(ctx context.Context, id int64) (string, error) {
	userUuid, err := dbw.Queries.GetUserUuidById(ctx, id)
	if err != nil {
		return "", err
	}

	return userUuid.String(), nil
}
