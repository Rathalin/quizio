package handlers

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
