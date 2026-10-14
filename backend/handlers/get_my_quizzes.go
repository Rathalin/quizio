package handlers

import (
	"context"
	"strings"
	"time"

	"github.com/Rathalin/quizio/backend/db/sqlc"
	"github.com/swaggest/usecase"
	"github.com/swaggest/usecase/status"
)

func (dbw *DBWrapper) GetMyQuizzes() usecase.Interactor {
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

		rows, err := dbw.Queries.GetMyQuizzes(ctx, sqlc.GetMyQuizzesParams{
			UserAccountID: userId,
			SortOption:    input.SortOption,
			SortDirection: strings.ToLower(input.SortDirection),
		})
		if err != nil {
			return logAndReturnError(err)
		}

		response := getMyQuizzesResponse{
			Quizzes: make([]getMyQuizzesResponseQuiz, 0, len(rows)),
		}
		for _, r := range rows {
			var description *string
			if r.Description != "" {
				desc := r.Description
				description = &desc
			}

			response.Quizzes = append(response.Quizzes, getMyQuizzesResponseQuiz{
				UUID:          r.Uuid.String(),
				CreatedAt:     r.CreatedAt,
				UpdatedAt:     r.UpdatedAt,
				Title:         r.Title,
				Description:   description,
				IsPublished:   r.IsPublished,
				ImageUrl:      r.ImageUrl,
				QuestionCount: int(r.QuestionCount),
				PlayCount:     int(r.PlayCount),
			})
		}

		*output = response
		return nil
	})
}
