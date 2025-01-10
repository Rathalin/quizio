package handlers

import (
	"context"
	"time"

	"github.com/swaggest/usecase"
)

func (dbw *DBWrapper) GetQuizzes() usecase.Interactor {
	type quiz struct {
		UUID        string    `json:"uuid"`
		CreatedAt   time.Time `json:"createdAt"`
		UpdatedAt   time.Time `json:"updatedAt"`
		Title       string    `json:"title"`
		Description string    `json:"description"`
		IsPublished bool      `json:"isPublished"`
		ImageUrl    string    `json:"imageUrl"`
		User        struct {
			UUID     string `json:"uuid"`
			Username string `json:"username"`
		} `json:"user"`
	}

	type reponse struct {
		Quizzes []quiz `json:"quizzes"`
	}

	return usecase.NewInteractor(func(_ context.Context, _ struct{}, output *reponse) error {
		rows, err := dbw.DB.Query(`
			SELECT q.uuid, q.created_at, q.updated_at, q.title, q.description_text, q.is_published, q.image_url, u.uuid, u.username
			FROM quiz q
			JOIN user_account u
				ON q.user_account_id = u.id
		`)
		if err != nil {
			return err
		}
		defer rows.Close()

		var response reponse
		var quizzes []quiz
		for rows.Next() {
			var q quiz
			if err := rows.Scan(&q.UUID, &q.CreatedAt, &q.UpdatedAt, &q.Title, &q.Description, &q.IsPublished, &q.ImageUrl, &q.User.UUID, &q.User.Username); err != nil {
				return err
			}
			quizzes = append(quizzes, q)
		}
		response.Quizzes = quizzes
		*output = response
		return nil
	})
}
