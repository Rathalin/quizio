package handlers

import (
	"context"

	"github.com/Rathalin/quizio/backend/models"

	"github.com/swaggest/usecase"
	"github.com/swaggest/usecase/status"
)

func (dbw *DBWrapper) GetAlerts() usecase.Interactor {
	type getAlertsRequest struct {
		VisibleTo string `query:"visibleTo" required:"true" enum:"everyone,authorized" validate:"required"`
	}

	type getAlertsResponse struct {
		Alerts []models.Alert `json:"alerts" required:"true" nullable:"false"`
	}

	return usecase.NewInteractor(func(ctx context.Context, input getAlertsRequest, output *getAlertsResponse) error {
		if err := validate.Struct(input); err != nil {
			return status.Wrap(logAndReturnError(err), status.InvalidArgument)
		}

		response := getAlertsResponse{
			Alerts: make([]models.Alert, 0),
		}
		alerts, err := dbw.Queries.GetAlerts(ctx, input.VisibleTo)
		if err != nil {
			return logAndReturnError(err)
		}

		for _, a := range alerts {
			response.Alerts = append(response.Alerts, models.Alert{
				UUID:       a.Uuid.String(),
				CreatedAt:  a.CreatedAt,
				UpdatedAt:  a.UpdatedAt,
				MarkdownDE: a.MarkdownDe,
				MarkdownEN: a.MarkdownEn,
				Severity:   a.Severity,
				ImageUrl:   a.ImageUrl,
				ImageSize:  a.ImageSize,
				IsActive:   a.IsActive,
				VisibleTo:  a.VisibleTo,
			})
		}

		*output = response
		return nil
	})
}
