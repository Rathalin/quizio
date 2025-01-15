package handlers

func (dbw *DBWrapper) isNewUsername(username string) (bool, error) {
	usernameCount := 0
	err := dbw.DB.QueryRow(`
		SELECT COUNT(*)
		FROM user_account
		WHERE username = $1
	`, username).Scan(&usernameCount)
	if err != nil {
		return false, err
	}

	return usernameCount == 0, nil
}
