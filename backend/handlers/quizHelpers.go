package handlers

func (dbw *DBWrapper) quizExists(uuid string) (bool, error) {
	quizCount := 0
	err := dbw.DB.QueryRow(`
		SELECT COUNT(*)
		FROM quiz
		WHERE uuid = $1
	`, uuid).Scan(&quizCount)
	if err != nil {
		return false, err
	}

	return quizCount > 0, nil
}
