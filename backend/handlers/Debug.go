package handlers

import (
	"context"
	"fmt"

	"github.com/swaggest/usecase"
)

func (dbw *DBWrapper) Debug() usecase.Interactor {
	type debugRequest struct {
	}

	type debugResponse struct {
	}

	return usecase.NewInteractor(func(ctx context.Context, input debugRequest, output *debugResponse) error {
		quizId := new(int64)
		*quizId = 1
		quizCount := 0
		dbw.DB.QueryRowContext(ctx, `
			SELECT COUNT(*)
			FROM quiz
			WHERE id = $1
		`, quizId).Scan(&quizCount)

		fmt.Printf("quizId: %v, Found count: %v", *quizId, quizCount)

		response := debugResponse{}
		*output = response
		return nil
	})
}
