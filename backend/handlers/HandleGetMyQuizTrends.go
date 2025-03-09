package handlers

import (
	"context"
	"fmt"
	"math"
	"time"

	"github.com/swaggest/usecase"
	"github.com/swaggest/usecase/status"
)

func (dbw *DBWrapper) HandleGetMyQuizTrends() usecase.Interactor {

	type getMyQuizTrendsRequest struct {
		QuizUUID string `path:"uuid" required:"true"`
	}

	type getMyQuizTrendsResponsePlayProtocolEntry struct {
		PlayedAt          time.Time `json:"playedAt" required:"true"`
		PlayCount         *int      `json:"playCount" required:"true" nullable:"true"`
		MigratedPlayCount *int      `json:"migratedPlayCount" required:"true" nullable:"true"`
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
			return status.Wrap(logAndReturnErrorMessage("quiz does not exists (invalid uuid)"), status.NotFound)
		}

		quizExists, err := dbw.QuizExistsForUser(input.QuizUUID, userId)
		if err != nil {
			return logAndReturnError(err)
		}
		if !quizExists {
			return status.Wrap(logAndReturnErrorMessage(fmt.Sprintf("quiz wtih uuid %v does not exists for this user", input.QuizUUID)), status.NotFound)
		}

		quizId, err := dbw.GetQuizId(input.QuizUUID)
		if err != nil {
			return logAndReturnError(err)
		}

		endDate := time.Now().Truncate(24 * time.Hour) // Today at midnight
		startDate := endDate.AddDate(-1, 0, 0)         // One year ago
		// Date on which the migration from Strapi to Postgres happened
		var migrationDate = time.Date(2025, 1, 27, 0, 0, 0, 0, time.UTC)

		response := getMyQuizTrendsResponse{
			UUID: input.QuizUUID,
			PlayProtocolStatistic: getMyQuizTrendsResponsePlayProtocolStatistic{
				MigrationDate: migrationDate,
			},
		}

		// Select quiz details
		err = dbw.DB.QueryRowContext(ctx, `
			SELECT
				q.created_at,
				q.updated_at,
				q.title,
				q.description_text,
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
			WHERE q.id = $1
			GROUP BY
				q.id,
				q.uuid,
				q.created_at,
				q.updated_at,
				q.title,
				q.description_text,
				q.is_published,
				q.image_url,
				u.uuid,
				u.username
		`, quizId).Scan(
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
			WHERE played_at >= NOW() - INTERVAL '1 year' 
				AND quiz_id = $1 
				AND played_at != $2
			GROUP BY date
			ORDER BY date
			`, quizId, migrationDate)
		if err != nil {
			return logAndReturnError(err)
		}

		var migratedPlayCount *int
		err = dbw.DB.QueryRowContext(ctx, `
				SELECT COUNT(*)
				FROM play_protocol_entry
				WHERE played_at = $1
			`, migrationDate).Scan(&migratedPlayCount)
		if err != nil {
			return logAndReturnError(err)
		}
		var averageDailyMigratedPlayCount *int
		daysBetween := int(endDate.Sub(startDate).Hours() / 24)
		avg := int(math.Round(float64(*migratedPlayCount) / float64(daysBetween)))
		averageDailyMigratedPlayCount = &avg

		entriesPerDayMap := make(map[string]int)
		for entriesPerDayRows.Next() {
			var dateString string
			var playCount int
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
		entriesPerDayRows.Close()

		var entriesPerDay []getMyQuizTrendsResponsePlayProtocolEntry
		// Iterate through all days in the range and fill missing days
		for d := startDate; !d.After(endDate); d = d.AddDate(0, 0, 1) {
			var playCount *int
			var migratedPlayCount *int
			zero := 0

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
