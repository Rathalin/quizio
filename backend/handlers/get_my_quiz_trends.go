package handlers

import (
	"context"
	"math"
	"time"

	"github.com/Rathalin/quizio/backend/db/sqlc"
	"github.com/google/uuid"
	"github.com/swaggest/usecase"
	"github.com/swaggest/usecase/status"
)

func (dbw *DBWrapper) GetMyQuizTrends() usecase.Interactor {
	type getMyQuizTrendsRequest struct {
		QuizUUID  string     `path:"uuid" required:"true"`
		StartDate *time.Time `query:"from"`
		EndDate   *time.Time `query:"to"`
	}

	type getMyQuizTrendsResponsePlayProtocolEntry struct {
		PlayedAt          time.Time `json:"playedAt" required:"true"`
		PlayCount         *float64  `json:"playCount" required:"true" nullable:"true"`
		MigratedPlayCount *float64  `json:"migratedPlayCount" required:"true" nullable:"true"`
	}

	type getMyQuizTrendsResponsePlayProtocolStatistic struct {
		PlayCountTotal int                                        `json:"playCount" required:"true"`
		MigrationDate  time.Time                                  `json:"migrationDate" required:"true"`
		EntriesByDay   []getMyQuizTrendsResponsePlayProtocolEntry `json:"entriesPerDay" required:"true" nullable:"false"`
	}

	type getMyQuizTrendsResponse struct {
		UUID                  string                                       `json:"uuid" required:"true"`
		CreatedAt             time.Time                                    `json:"createdAt" required:"true"`
		UpdatedAt             time.Time                                    `json:"updatedAt" required:"true"`
		Title                 string                                       `json:"title" required:"true"`
		Description           *string                                      `json:"description" required:"true" nullable:"true"`
		IsPublished           bool                                         `json:"isPublished" required:"true"`
		ImageUrl              *string                                      `json:"imageUrl" required:"true" nullable:"true"`
		QuestionCount         int                                          `json:"questionCount" required:"true"`
		PlayProtocolStatistic getMyQuizTrendsResponsePlayProtocolStatistic `json:"playProtocolStatistic" required:"true"`
	}

	return usecase.NewInteractor(func(ctx context.Context, input getMyQuizTrendsRequest, output *getMyQuizTrendsResponse) error {
		userId, err := getUserIdFromContext(ctx)
		if err != nil {
			return logAndReturnError(err)
		}

		if !isValidUUID(input.QuizUUID) {
			return status.Wrap(logAndReturnErrorMessage("quiz does not exist (invalid uuid)"), status.NotFound)
		}

		// Date on which the migration from Strapi to Postgres happened
		var migrationDate = time.Date(2025, 1, 27, 0, 0, 0, 0, time.UTC)

		response := getMyQuizTrendsResponse{
			UUID: input.QuizUUID,
			PlayProtocolStatistic: getMyQuizTrendsResponsePlayProtocolStatistic{
				MigrationDate: migrationDate,
			},
		}

		quizUUID, err := uuid.Parse(input.QuizUUID)
		if err != nil {
			return status.Wrap(logAndReturnErrorMessage("quiz does not exist (invalid uuid)"), status.NotFound)
		}

		// Select quiz details
		header, err := dbw.Queries.GetMyQuizTrendsHeader(ctx, sqlc.GetMyQuizTrendsHeaderParams{
			Uuid:          quizUUID,
			UserAccountID: userId,
		})
		if err != nil {
			return logAndReturnError(err)
		}

		var description *string
		if header.Description != "" {
			d := header.Description
			description = &d
		}

		response.CreatedAt = header.CreatedAt
		response.UpdatedAt = header.UpdatedAt
		response.Title = header.Title
		response.Description = description
		response.IsPublished = header.IsPublished
		response.ImageUrl = header.ImageUrl
		response.QuestionCount = int(header.QuestionCount)
		response.PlayProtocolStatistic.PlayCountTotal = int(header.PlayCount)

		now := time.Now().UTC()
		nowDate := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, time.UTC)

		quizCreatedAtDate := time.Date(
			response.CreatedAt.Year(),
			response.CreatedAt.Month(),
			response.CreatedAt.Day(),
			0, 0, 0, 0, time.UTC,
		)

		var startDate time.Time
		if input.StartDate != nil {
			startDate = time.Date(
				input.StartDate.Year(),
				input.StartDate.Month(),
				input.StartDate.Day(),
				0, 0, 0, 0, time.UTC,
			)
		} else {
			startDate = quizCreatedAtDate
		}

		var endDate time.Time
		if input.EndDate != nil {
			endDate = time.Date(
				input.EndDate.Year(),
				input.EndDate.Month(),
				input.EndDate.Day(),
				0, 0, 0, 0, time.UTC,
			)
		} else {
			endDate = nowDate
		}

		if endDate.Before(startDate) {
			return status.Wrap(logAndReturnErrorMessage("from date has to be before to date"), status.InvalidArgument)
		}
		if endDate.After(nowDate.Add(24 * time.Hour)) {
			return status.Wrap(logAndReturnErrorMessage("to date cannot be in the future"), status.InvalidArgument)
		}
		if input.StartDate != nil && startDate.Before(quizCreatedAtDate) && endDate.Sub(startDate) > 366*24*time.Hour {
			return status.Wrap(logAndReturnErrorMessage("date range before quiz creation cannot exceed 366 days"), status.InvalidArgument)
		}
		if endDate.Sub(startDate) > 3652*24*time.Hour {
			return status.Wrap(logAndReturnErrorMessage("date range cannot exceed 10 years"), status.InvalidArgument)
		}

		// Select protocol entries
		entries, err := dbw.Queries.GetPlayProtocolEntriesByDateRange(ctx, sqlc.GetPlayProtocolEntriesByDateRangeParams{
			QuizID:        header.ID,
			StartDate:     startDate,
			EndDate:       endDate,
			MigrationDate: migrationDate,
		})
		if err != nil {
			return logAndReturnError(err)
		}

		migratedCount, err := dbw.Queries.GetMigratedPlayCount(ctx, sqlc.GetMigratedPlayCountParams{
			QuizID:   header.ID,
			PlayedAt: migrationDate,
		})
		if err != nil {
			return logAndReturnError(err)
		}

		migratedPlayCountVal := float64(migratedCount)
		migratedPlayCount := &migratedPlayCountVal

		var averageDailyMigratedPlayCount *float64

		daysBetween := migrationDate.Sub(response.CreatedAt).Hours() / 24
		if daysBetween <= 0 {
			daysBetween = 1
		}
		avg := *migratedPlayCount / daysBetween
		roundDigits := float64(3)
		roundedAvg := math.Round(avg*math.Pow(10, roundDigits)) / math.Pow(10, roundDigits)
		averageDailyMigratedPlayCount = &roundedAvg

		entriesPerDayMap := make(map[string]float64)
		for _, entry := range entries {
			entriesPerDayMap[entry.EntryDate] = float64(entry.PlayCount)
		}

		var entriesPerDay []getMyQuizTrendsResponsePlayProtocolEntry
		// Iterate through all days in the range and fill missing days
		for d := startDate; !d.After(endDate); d = d.AddDate(0, 0, 1) {
			var playCount *float64
			var migratedPlayCount *float64
			var zero float64 = 0

			// Special case to connect two entries
			if d.Equal(migrationDate) {
				migratedPlayCount = &zero
			}

			if d.Before(migrationDate) {
				migratedPlayCount = averageDailyMigratedPlayCount
			} else {
				dateStr := d.Format("2006-01-02")
				count, exists := entriesPerDayMap[dateStr]

				if !exists {
					playCount = &zero
				} else {
					playCount = &count
				}
			}

			entriesPerDay = append(entriesPerDay, getMyQuizTrendsResponsePlayProtocolEntry{
				PlayedAt:          d,
				PlayCount:         playCount,
				MigratedPlayCount: migratedPlayCount,
			})
		}

		response.PlayProtocolStatistic.EntriesByDay = entriesPerDay
		*output = response
		return nil
	})
}
