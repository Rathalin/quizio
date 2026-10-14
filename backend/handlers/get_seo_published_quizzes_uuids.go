package handlers

import (
	"context"

	"github.com/swaggest/usecase"
	"github.com/swaggest/usecase/status"
)

func (dbw *DBWrapper) GetSeoPublishedQuizzesUuids() usecase.Interactor {
	type publishedQuizzesUuidsRequest struct{}

	type publishedQuizzesUuidsResponse = []string

	return usecase.NewInteractor(func(ctx context.Context, input publishedQuizzesUuidsRequest, output *publishedQuizzesUuidsResponse) error {
		if err := validate.Struct(input); err != nil {
			return status.Wrap(logAndReturnError(err), status.InvalidArgument)
		}

		uuids, err := dbw.Queries.GetSeoPublishedQuizzesUuids(ctx)
		if err != nil {
			return logAndReturnError(err)
		}

		publishedQuizzesUuids := make([]string, len(uuids))
		for i, u := range uuids {
			publishedQuizzesUuids[i] = u.String()
		}
		*output = publishedQuizzesUuids
		return nil
	})
}
