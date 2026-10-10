package handlers

import (
	"context"
	"math"
	"time"

	"github.com/swaggest/usecase"
	"github.com/swaggest/usecase/status"
)

func (dbw *DBWrapper) GetMyQuizTrends() usecase.Interactor {
	type getMyQuizTrendsRequest struct {
		QuizUUID  string    `path:"uuid" required:"true"`
		StartDate time.Time `query:"from" required:"true"`
		EndDate   time.Time `query:"to" required:"true"`
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

		if input.EndDate.Before(input.StartDate) {
			return status.Wrap(logAndReturnErrorMessage("from date has to be before to date"), status.InvalidArgument)
		}

		// Date on which the migration from Strapi to Postgres happened
		var migrationDate = time.Date(2025, 1, 27, 0, 0, 0, 0, time.UTC)

		response := getMyQuizTrendsResponse{
			UUID: input.QuizUUID,
			PlayProtocolStatistic: getMyQuizTrendsResponsePlayProtocolStatistic{
				MigrationDate: migrationDate,
			},
		}

		var quizId int64
		// Select quiz details
		err = dbw.DB.QueryRowContext(ctx, `
			SELECT
				q.id,
				q.created_at,
				q.updated_at,
				q.title,
				COALESCE(q.description_text, ''),
				q.is_published,
				q.image_url,
				COUNT(DISTINCT qn.id) AS question_count,
				COUNT(DISTINCT pe.id) AS play_count
			FROM quiz q
			JOIN user_account u
				ON u.id = q.user_account_id
			LEFT JOIN question qn
				ON qn.quiz_id = q.id
			LEFT JOIN play_protocol_entry pe
				ON pe.quiz_id = q.id
			WHERE q.uuid = $1 AND q.user_account_id = $2
			GROUP BY
				q.id,
				q.uuid,
				q.created_at,
				q.updated_at,
				q.title,
				COALESCE(q.description_text, ''),
				q.is_published,
				q.image_url,
				u.uuid,
				u.username
		`, input.QuizUUID, userId).Scan(
			&quizId,
			&response.CreatedAt,
			&response.UpdatedAt,
			&response.Title,
			&response.Description,
			&response.IsPublished,
			&response.ImageUrl,
			&response.QuestionCount,
			&response.PlayProtocolStatistic.PlayCountTotal,
		)
		if err != nil {
			return logAndReturnError(err)
		}

		// Select protocol entries
		entriesPerDayRows, err := dbw.DB.QueryContext(ctx, `
			SELECT TO_CHAR(played_at, 'YYYY-MM-DD') AS date, COUNT(*) AS play_count
			FROM play_protocol_entry
			WHERE played_at >= $2 AND played_at <= $3
				AND quiz_id = $1 
				AND played_at != $4
			GROUP BY date
			ORDER BY date
			`, quizId, input.StartDate, input.EndDate, migrationDate)
		if err != nil {
			return logAndReturnError(err)
		}
		defer entriesPerDayRows.Close()

		var migratedPlayCount *float64
		err = dbw.DB.QueryRowContext(ctx, `
				SELECT COUNT(*)
				FROM play_protocol_entry
				WHERE quiz_id = $1
					AND played_at = $2
			`, quizId, migrationDate).Scan(&migratedPlayCount)
		if err != nil {
			return logAndReturnError(err)
		}
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
		for entriesPerDayRows.Next() {
			var dateString string
			var playCount float64
			err := entriesPerDayRows.Scan(&dateString, &playCount)
			if err != nil {
				return logAndReturnError(err)
			}

			date, err := time.Parse("2006-01-02", dateString)
			if err != nil {
				return logAndReturnError(err)
			}
			entriesPerDayMap[date.Format("2006-01-02")] = playCount
		}
		if err := entriesPerDayRows.Err(); err != nil {
			return logAndReturnError(err)
		}

		var entriesPerDay []getMyQuizTrendsResponsePlayProtocolEntry
		// Iterate through all days in the range and fill missing days
		for d := input.StartDate; !d.After(input.EndDate); d = d.AddDate(0, 0, 1) {
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
