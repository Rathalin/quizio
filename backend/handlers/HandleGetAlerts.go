package handlers

import (
	"context"

	"github.com/Rathalin/quizio/backend/models"

	"github.com/swaggest/usecase"
)

func (dbw *DBWrapper) HandleGetAlerts() usecase.Interactor {
	type getAlertsRequest struct {
		VisibleTo string `query:"visibleTo" required:"true" enum:"everyone,authorized"`
		Locale    string `query:"locale" required:"true" enum:"de,en"`
	}

	type getAlertsResponse struct {
		Alerts []models.Alert `json:"alerts" required:"true" nullable:"false"`
	}

	return usecase.NewInteractor(func(ctx context.Context, input getAlertsRequest, output *getAlertsResponse) error {
		response := getAlertsResponse{
			Alerts: make([]models.Alert, 0),
		}
		rows, err := dbw.DB.QueryContext(ctx, `
			SELECT uuid, created_at, updated_at, markdown_content, severity, image_url, image_size, is_active, visible_to, locale
			FROM alert
			WHERE is_active 
				AND (visible_to = 'everyone' OR visible_to = $1)
				AND locale = $2
			ORDER BY order_index ASC
		`, input.VisibleTo, input.Locale)
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
				&alert.VisibleTo,
				&alert.Locale,
			)
			response.Alerts = append(response.Alerts, alert)
		}

		*output = response
		return nil
	})
}
