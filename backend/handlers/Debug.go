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
		UserID int64 `json:"userId" required:"true"`
	}

	return usecase.NewInteractor(func(ctx context.Context, input debugRequest, output *debugResponse) error {
		userID, err := getUserIdFromContext(ctx)
		if err != nil {
			return logAndReturnError(err)
		}

		fmt.Printf("userId: %v\n", userID)

		response := debugResponse{UserID: userID}
		*output = response
		return nil
	})
}
