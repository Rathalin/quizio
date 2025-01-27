package handlers

import (
	"context"

	"github.com/Rathalin/quizio/backend/models"

	"github.com/swaggest/usecase"
)

func (dbw *DBWrapper) HandleGetAlerts() usecase.Interactor {
	type getAlertsRequest struct{}

	type getAlertsResponse struct {
		Alerts []models.Alert `json:"alerts" required:"true" nullable:"false"`
	}

	return usecase.NewInteractor(func(ctx context.Context, input getAlertsRequest, output *getAlertsResponse) error {
		response := getAlertsResponse{
			Alerts: make([]models.Alert, 0),
		}
		rows, err := dbw.DB.QueryContext(ctx, `
			SELECT uuid, created_at, updated_at, markdown_content, severity, image_url, image_size, is_active
			FROM alert
			WHERE is_active
			ORDER BY order_index ASC
		`)
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
				&alert.MarkdownContent,
				&alert.Severity,
				&alert.ImageUrl,
				&alert.ImageSize,
				&alert.IsActive,
			)
			response.Alerts = append(response.Alerts, alert)
		}

		*output = response
		return nil
	})
}
