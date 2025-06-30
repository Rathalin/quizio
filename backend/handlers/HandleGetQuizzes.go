package handlers

import (
	"context"
	"fmt"
	"math"
	"strings"
	"time"

	"github.com/Rathalin/quizio/backend/models"

	"github.com/swaggest/usecase"
	"github.com/swaggest/usecase/status"
)

func (dbw *DBWrapper) HandleGetQuizzes() usecase.Interactor {
	type getQuizzesRequest struct {
		Page          int    `query:"page" required:"true" example:"0"`
		PageSize      int    `query:"pageSize" required:"true" example:"5"`
		SortOption    string `query:"sortOption" required:"true" enum:"createdAt,playCount" example:"createdAt"`
		SortDirection string `query:"sortDirection" required:"true" enum:"asc,desc" example:"desc"`
	}

	type getQuizzesResponseQuiz struct {
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
		Quizzes []getQuizzesResponseQuiz `json:"quizzes" required:"true" nullable:"false"`
		Meta    models.Meta              `json:"meta" required:"true" nullable:"false"`
	}

	return usecase.NewInteractor(func(ctx context.Context, input getQuizzesRequest, output *getQuizzesResponse) error {
		if err := validate.Struct(input); err != nil {
			return status.Wrap(logAndReturnError(err), status.InvalidArgument)
		}
		
		totalQuizCount := 0
		err := dbw.DB.QueryRow(`
			SELECT COUNT(*)
			FROM quiz
		`).Scan(&totalQuizCount)
		if err != nil {
			return logAndReturnError(err)
		}
		sortOption := "q.created_at"
		if input.SortOption == "playCount" {
			sortOption = "play_count"
		}
		sortDirection := "ASC"
		if strings.ToUpper(input.SortDirection) == "DESC" {
			sortDirection = "DESC"
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
			WHERE q.is_published
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
		`, sortOption, sortDirection), input.PageSize, input.Page*input.PageSize)
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
			Quizzes: make([]getQuizzesResponseQuiz, 0),
		}
		var quizzes []getQuizzesResponseQuiz = make([]getQuizzesResponseQuiz, 0)
		for rows.Next() {
			var q getQuizzesResponseQuiz
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
