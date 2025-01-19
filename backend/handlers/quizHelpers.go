package handlers

func (dbw *DBWrapper) QuizExists(uuid string) (bool, error) {
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

func (dbw *DBWrapper) GetQuizId(uuid string) (int64, error) {
	var quizId int64
	err := dbw.DB.QueryRow(`
		SELECT id
		FROM quiz
		WHERE uuid = $1
	`, uuid).Scan(&quizId)
	if err != nil {
		return quizId, err
	}

	return quizId, nil
}
