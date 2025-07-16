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
		rows, err := dbw.DB.QueryContext(ctx, `
			SELECT uuid, created_at, updated_at, markdown_de, markdown_en, severity, image_url, image_size, is_active, visible_to
			FROM alert
			WHERE is_active 
				AND (visible_to = 'everyone' OR visible_to = $1)
			ORDER BY order_index ASC
		`, input.VisibleTo)
		if err != nil {
			return logAndReturnError(err)
		}

		defer rows.Close()
		for rows.Next() {
			alert := models.Alert{}
			rows.Scan(
				&alert.UUID,
				&alert.CreatedAt,
				&alert.UpdatedAt,
				&alert.MarkdownDE,
				&alert.MarkdownEN,
				&alert.Severity,
				&alert.ImageUrl,
				&alert.ImageSize,
				&alert.IsActive,
				&alert.VisibleTo,
			)
			response.Alerts = append(response.Alerts, alert)
		}

		*output = response
		return nil
	})
}
