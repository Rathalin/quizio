package handlers

import (
	"context"

	"github.com/swaggest/usecase"
)

func (dbw *DBWrapper) GetQuizzesUuids() usecase.Interactor {
	return usecase.NewInteractor(func(_ context.Context, _ struct{}, output *[]string) error {
		rows, err := dbw.DB.Query(`
			SELECT uuid
			FROM quizzes
		`)
		if err != nil {
			return err
		}
		defer rows.Close()

		var uuids []string
		for rows.Next() {
			var uuid string
			if err := rows.Scan(&uuid); err != nil {
				return err
			}
			uuids = append(uuids, uuid)
		}
		*output = uuids
		return nil
	})
}
