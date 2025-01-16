package handlers

import (
	"context"
	"math"
	"quizio/backend/models"
	"time"

	"github.com/swaggest/usecase"
)

func (dbw *DBWrapper) GetQuizzes() usecase.Interactor {
	type getQuizzesRequest struct {
		Page     int `query:"page" example:"0"`
		PageSize int `query:"pageSize" example:"5"`
	}

	type quiz struct {
		UUID          string    `json:"uuid" required:"true"`
		CreatedAt     time.Time `json:"createdAt" required:"true"`
		UpdatedAt     time.Time `json:"updatedAt" required:"true"`
		Title         string    `json:"title" required:"true"`
		Description   *string   `json:"description,omitempty nullable:"false"`
		IsPublished   bool      `json:"isPublished" required:"true"`
		ImageUrl      *string   `json:"imageUrl,omitempty nullable:"false"`
		QuestionCount int       `json:"questionCount" required:"true"`
		PlayCount     int       `json:"playCount" required:"true"`
		User          struct {
			UUID     string `json:"uuid" required:"true"`
			Username string `json:"username" required:"true"`
		} `json:"user" required:"true"`
	}

	type getQuizzesResponse struct {
		Quizzes []quiz      `json:"quizzes" required:"true" nullable:"false"`
		Meta    models.Meta `json:"meta" required:"true" nullable:"false"`
	}

	return usecase.NewInteractor(func(_ context.Context, input getQuizzesRequest, output *getQuizzesResponse) error {
		totalQuizCount := 0
		err := dbw.DB.QueryRow(`
			SELECT COUNT(*)
			FROM quiz
		`).Scan(&totalQuizCount)
		if err != nil {
			return err
		}

		rows, err := dbw.DB.Query(`
			SELECT 
				q.uuid, 
				q.created_at, 
				q.updated_at, 
				q.title, 
				q.description_text, 
				q.is_published, 
				q.image_url, 
				u.uuid, 
				u.username, 
				COUNT(DISTINCT qn.id) AS question_count,
				COUNT(DISTINCT pe.id) AS play_count
			FROM quiz q
			JOIN user_account u
				ON u.id = q.user_account_id
			LEFT JOIN question qn
				ON qn.quiz_id = q.id
			LEFT JOIN play_protocol_entry pe
				ON pe.quiz_id = q.id
			GROUP BY 
				q.uuid, 
				q.created_at, 
				q.updated_at, 
				q.title, 
				q.description_text, 
				q.is_published, 
				q.image_url, 
				u.uuid, 
				u.username
			LIMIT $1
			OFFSET $2
		`, input.PageSize, input.Page*input.PageSize)
		if err != nil {
			return err
		}
		defer rows.Close()

		response := getQuizzesResponse{
			Meta: models.Meta{
				Page:       input.Page,
				PageSize:   input.PageSize,
				TotalItems: totalQuizCount,
				TotalPages: int(math.Ceil(float64(totalQuizCount) / float64(input.PageSize))),
			},
			Quizzes: make([]quiz, 0),
		}
		var quizzes []quiz = make([]quiz, 0)
		for rows.Next() {
			var q quiz
			if err := rows.Scan(
				&q.UUID,
				&q.CreatedAt,
				&q.UpdatedAt,
				&q.Title,
				&q.Description,
				&q.IsPublished,
				&q.ImageUrl,
				&q.User.UUID,
				&q.User.Username,
				&q.QuestionCount,
				&q.PlayCount,
			); err != nil {
				return err
			}
			quizzes = append(quizzes, q)
		}
		response.Quizzes = quizzes
		*output = response
		return nil
	})
}
