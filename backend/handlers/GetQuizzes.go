package handlers

import (
	"context"
	"time"

	"github.com/swaggest/usecase"
)

func (dbw *DBWrapper) GetQuizzes() usecase.Interactor {
	type quiz struct {
		UUID          string    `json:"uuid" required:"true"`
		CreatedAt     time.Time `json:"createdAt" required:"true"`
		UpdatedAt     time.Time `json:"updatedAt" required:"true"`
		Title         string    `json:"title" required:"true"`
		Description   *string   `json:"description,omitempty"`
		IsPublished   bool      `json:"isPublished" required:"true"`
		ImageUrl      *string   `json:"imageUrl,omitempty"`
		QuestionCount int       `json:"questionCount" required:"true"`
		User          struct {
			UUID     string `json:"uuid"`
			Username string `json:"username"`
		} `json:"user"`
	}

	type reponse struct {
		Quizzes []quiz `json:"quizzes" required:"true" nullable:"false"`
	}

	return usecase.NewInteractor(func(_ context.Context, _ struct{}, output *reponse) error {
		rows, err := dbw.DB.Query(`
			SELECT 
				q.uuid, q.created_at, q.updated_at, q.title, q.description_text, q.is_published, q.image_url, u.uuid, u.username, COUNT(*) question_count
			FROM quiz q
			JOIN user_account u
				ON u.id = q.user_account_id
			JOIN question qn
				ON qn.quiz_id = q.id
			GROUP BY q.uuid, q.created_at, q.updated_at, q.title, q.description_text, q.is_published, q.image_url, u.uuid, u.username
		`)
		if err != nil {
			return err
		}
		defer rows.Close()

		var response reponse
		var quizzes []quiz
		for rows.Next() {
			var q quiz
			if err := rows.Scan(&q.UUID, &q.CreatedAt, &q.UpdatedAt, &q.Title, &q.Description, &q.IsPublished, &q.ImageUrl, &q.User.UUID, &q.User.Username, &q.QuestionCount); err != nil {
				return err
			}
			quizzes = append(quizzes, q)
		}
		response.Quizzes = quizzes
		*output = response
		return nil
	})
}
