package handlers

import (
	"context"
	"math"
	"strings"
	"time"

	"github.com/Rathalin/quizio/backend/db/sqlc"
	"github.com/Rathalin/quizio/backend/models"

	"github.com/swaggest/usecase"
	"github.com/swaggest/usecase/status"
)

func (dbw *DBWrapper) GetQuizzes() usecase.Interactor {
	type getQuizzesRequest struct {
		Page          int    `query:"page" required:"true" example:"0" validate:"min=0"`
		PageSize      int    `query:"pageSize" required:"true" example:"5" validate:"min=1,max=50"`
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

		totalQuizCount, err := dbw.Queries.GetTotalPublishedQuizCount(ctx)
		if err != nil {
			return logAndReturnError(err)
		}

		rows, err := dbw.Queries.GetQuizzes(ctx, sqlc.GetQuizzesParams{
			Limit:         int32(input.PageSize),
			Offset:        int32(input.Page * input.PageSize),
			SortOption:    input.SortOption,
			SortDirection: strings.ToLower(input.SortDirection),
		})
		if err != nil {
			return logAndReturnError(err)
		}

		response := getQuizzesResponse{
			Meta: models.Meta{
				Page:       input.Page,
				PageSize:   input.PageSize,
				TotalItems: int(totalQuizCount),
				TotalPages: int(math.Ceil(float64(totalQuizCount) / float64(input.PageSize))),
			},
			Quizzes: make([]getQuizzesResponseQuiz, 0, len(rows)),
		}

		for _, r := range rows {
			var description *string
			if r.Description != "" {
				desc := r.Description
				description = &desc
			}

			q := getQuizzesResponseQuiz{
				UUID:          r.Uuid.String(),
				CreatedAt:     r.CreatedAt,
				UpdatedAt:     r.UpdatedAt,
				Title:         r.Title,
				Description:   description,
				IsPublished:   r.IsPublished,
				ImageUrl:      r.ImageUrl,
				QuestionCount: int(r.QuestionCount),
				PlayCount:     int(r.PlayCount),
			}
			q.User.UUID = r.UserUuid.String()
			q.User.Username = r.Username
			response.Quizzes = append(response.Quizzes, q)
		}

		*output = response
		return nil
	})
}
