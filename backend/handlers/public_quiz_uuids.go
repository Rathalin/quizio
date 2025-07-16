package handlers

import (
	"context"

	"github.com/swaggest/usecase"
	"github.com/swaggest/usecase/status"
)

func (dbw *DBWrapper) PublishedQuizzesUuids() usecase.Interactor {
	type publishedQuizzesUuidsRequest struct{}

	type publishedQuizzesUuidsResponse = []string

	return usecase.NewInteractor(func(ctx context.Context, input publishedQuizzesUuidsRequest, output *publishedQuizzesUuidsResponse) error {
		if err := validate.Struct(input); err != nil {
			return status.Wrap(logAndReturnError(err), status.InvalidArgument)
		}

		publishedQuizesUuids := []string{}
		rows, err := dbw.DB.QueryContext(ctx, `
			SELECT uuid
			FROM quiz
			WHERE is_published = true
		`)
		if err != nil {
			return logAndReturnError(err)
		}
		defer rows.Close()
		for rows.Next() {
			quizUuid := ""
			err = rows.Scan(&quizUuid)
			publishedQuizesUuids = append(publishedQuizesUuids, quizUuid)
			if err != nil {
				return logAndReturnError(err)
			}
		}
		*output = publishedQuizesUuids
		return nil
	})
}
