package handlers

import (
	"context"
	"fmt"
	"math"
	"quizio/backend/models"
	"strings"
	"time"

	"github.com/swaggest/usecase"
)

func (dbw *DBWrapper) HandleGetQuizzes() usecase.Interactor {

	type getQuizzesRequest struct {
		Page          int    `query:"page" required:"true" example:"0"`
		PageSize      int    `query:"pageSize" required:"true" example:"5"`
		Sort          string `query:"sort" required:"true" enum:"createdAt,playCount" example:"createdAt"`
		SortDirection string `query:"sortDirection" required:"true" enum:"asc,desc" example:"desc"`
	}

	type quiz struct {
		UUID          string    `json:"uuid" required:"true"`
		CreatedAt     time.Time `json:"createdAt" required:"true"`
		UpdatedAt     time.Time `json:"updatedAt" required:"true"`
		Title         string    `json:"title" required:"true"`
		Description   *string   `json:"description" required:"true" nullable:"true"`
		IsPublished   bool      `json:"isPublished" required:"true"`
		ImageUrl      *string   `json:"imageUrl" required:"true" nullable:"true"`
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

	return usecase.NewInteractor(func(ctx context.Context, input getQuizzesRequest, output *getQuizzesResponse) error {
		totalQuizCount := 0
		err := dbw.DB.QueryRow(`
			SELECT COUNT(*)
			FROM quiz
		`).Scan(&totalQuizCount)
		if err != nil {
			return logAndReturnError(err)
		}
		sort := "q.created_at"
		if input.Sort == "playCount" {
			sort = "play_count"
		}

		rows, err := dbw.DB.Query(fmt.Sprintf(`
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
			ORDER BY %s %s
			LIMIT $1
			OFFSET $2
		`, sort, strings.ToUpper(input.SortDirection)), input.PageSize, input.Page*input.PageSize)
		if err != nil {
			return logAndReturnError(err)
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
				return logAndReturnError(err)
			}
			quizzes = append(quizzes, q)
		}
		response.Quizzes = quizzes
		*output = response
		return nil
	})
}
