package handlers

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/swaggest/usecase"
	"github.com/swaggest/usecase/status"
)

func (dbw *DBWrapper) HandleGetMyQuizzes() usecase.Interactor {
	type getMyQuizzesRequest struct {
		SortOption    string `query:"sortOption" required:"true" enum:"createdAt,playCount" example:"createdAt"`
		SortDirection string `query:"sortDirection" required:"true" enum:"asc,desc" example:"desc"`
	}

	type getMyQuizzesResponseQuiz struct {
		UUID          string    `json:"uuid" required:"true"`
		CreatedAt     time.Time `json:"createdAt" required:"true"`
		UpdatedAt     time.Time `json:"updatedAt" required:"true"`
		Title         string    `json:"title" required:"true"`
		Description   *string   `json:"description" required:"true" nullable:"true"`
		IsPublished   bool      `json:"isPublished" required:"true"`
		ImageUrl      *string   `json:"imageUrl" required:"true" nullable:"true"`
		QuestionCount int       `json:"questionCount" required:"true"`
		PlayCount     int       `json:"playCount" required:"true"`
	}

	type getMyQuizzesResponse struct {
		Quizzes []getMyQuizzesResponseQuiz `json:"quizzes" required:"true" nullable:"false"`
	}

	return usecase.NewInteractor(func(ctx context.Context, input getMyQuizzesRequest, output *getMyQuizzesResponse) error {
		userId, err := getUserIdFromContext(ctx)
		if err != nil {
			return logAndReturnError(err)
		}

		if err := validate.Struct(input); err != nil {
			return status.Wrap(logAndReturnError(err), status.InvalidArgument)
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
				q.id,
				q.uuid,
				q.created_at,
				q.updated_at,
				q.title,
				q.description_text,
				q.is_published,
				q.image_url,
				COUNT(DISTINCT qn.id) AS question_count,
				COUNT(DISTINCT pe.id) AS play_count
			FROM quiz q
			JOIN user_account u
				ON u.id = q.user_account_id
			LEFT JOIN question qn
				ON qn.quiz_id = q.id
			LEFT JOIN play_protocol_entry pe
				ON pe.quiz_id = q.id
			WHERE q.user_account_id = $1
			GROUP BY
				q.id,
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
		`, sortOption, sortDirection), userId)
		if err != nil {
			return logAndReturnError(err)
		}
		defer rows.Close()

		response := getMyQuizzesResponse{
			Quizzes: make([]getMyQuizzesResponseQuiz, 0),
		}
		var quizzes []getMyQuizzesResponseQuiz = make([]getMyQuizzesResponseQuiz, 0)
		for rows.Next() {
			var q getMyQuizzesResponseQuiz
			var quizId int
			if err := rows.Scan(
				&quizId,
				&q.UUID,
				&q.CreatedAt,
				&q.UpdatedAt,
				&q.Title,
				&q.Description,
				&q.IsPublished,
				&q.ImageUrl,
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
