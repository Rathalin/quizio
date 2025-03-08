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

	type getMyQuizTrendsResponseMonthlyPlays struct {
		MonthDate     string `json:"month" required:"true" example:"2025-01"`
		Plays         *int   `json:"plays" required:"true" nullable:"true"`
		MigratedPlays *int   `json:"migratedPlays" required:"true" nullable:"true"`
	}

	type getMyQuizTrendsResponse struct {
		UUID          string                                `json:"uuid" required:"true"`
		CreatedAt     time.Time                             `json:"createdAt" required:"true"`
		UpdatedAt     time.Time                             `json:"updatedAt" required:"true"`
		Title         string                                `json:"title" required:"true"`
		Description   *string                               `json:"description" required:"true" nullable:"true"`
		IsPublished   bool                                  `json:"isPublished" required:"true"`
		ImageUrl      *string                               `json:"imageUrl" required:"true" nullable:"true"`
		QuestionCount int                                   `json:"questionCount" required:"true"`
		PlayCount     int                                   `json:"playCount" required:"true"`
		MigrationDate time.Time                             `json:"migrationDate" required:"true"`
		MonthlyPlays  []getMyQuizTrendsResponseMonthlyPlays `json:"monthlyPlays" required:"true" nullable:"false"`
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

		// Query entries which where not migrated
		var migrationDate = time.Date(2025, 1, 27, 0, 0, 0, 0, time.UTC)
		response := getMyQuizTrendsResponse{
			UUID:          input.QuizUUID,
			MigrationDate: migrationDate,
		}
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
			&response.PlayCount,
		)
		if err != nil {
			return logAndReturnError(err)
		}

		monthlyRows, err := dbw.DB.QueryContext(ctx, `
				SELECT TO_CHAR(DATE_TRUNC('month', played_at), 'YYYY-MM') AS month, COUNT(*) AS play_count
				FROM play_protocol_entry
				WHERE played_at >= NOW() - INTERVAL '1 year' 
					AND quiz_id = $1 
					AND NOT played_at = $2
				GROUP BY month
				ORDER BY month
			`, quizId, migrationDate)
		if err != nil {
			return logAndReturnError(err)
		}

		// Query migrated entries (those artificially assigned to "2025-01-27")
		var migratedPlayCount *int
		err = dbw.DB.QueryRowContext(ctx, `
				SELECT COUNT(*)
				FROM play_protocol_entry
				WHERE played_at = $1
			`, migrationDate).Scan(&migratedPlayCount)
		if err != nil {
			return logAndReturnError(err)
		}
		var averageDailyPlays *int
		monthsBeforeMigration := monthsBetween(response.CreatedAt, migrationDate)
		if monthsBeforeMigration > 0 && migratedPlayCount != nil {
			avg := int(math.Ceil(float64(*migratedPlayCount) / float64(monthsBeforeMigration)))
			averageDailyPlays = &avg
			fmt.Printf("%d / %d -> %d\n", migratedPlayCount, monthsBeforeMigration, averageDailyPlays)
		}

		playCounts := make(map[string]int)

		for monthlyRows.Next() {
			var month = ""
			var count = 0
			err := monthlyRows.Scan(&month, &count)
			if err != nil {
				return logAndReturnError(err)
			}
			fmt.Printf("playCounts[%s] -> %d\n", month, count)
			playCounts[month] = count
		}
		monthlyRows.Close()

		var monthlyPlays []getMyQuizTrendsResponseMonthlyPlays
		now := time.Now()
		for i := 11; i >= 0; i-- {
			monthDate := now.AddDate(0, -i, 0)
			monthDateString := monthDate.Format("2006-01")
			fmt.Printf("%s\n", monthDateString)
			monthlyPlayCount := getMyQuizTrendsResponseMonthlyPlays{
				MonthDate: monthDateString,
			}
			if monthDate.Year() < 2025 {
				monthlyPlayCount.MigratedPlays = averageDailyPlays
				fmt.Printf("%d (year) < 2025 -> %d (averageDailyPlays)\n", monthDate.Year(), averageDailyPlays)
			} else {
				playCountsOfMonth := playCounts[monthDateString]
				monthlyPlayCount.Plays = &playCountsOfMonth
				fmt.Printf("%d (year) >= 2025 -> %d (playCounts[monthDate])\n", monthDate.Year(), playCounts[monthDateString])
			}

			// Add a 0 to 2025-01 to connect lines
			if monthDate.Year() == 2025 && monthDate.Month() == 1 {
				zero := 0
				monthlyPlayCount.MigratedPlays = &zero
			}

			monthlyPlays = append(monthlyPlays, monthlyPlayCount)
		}

		response.MonthlyPlays = monthlyPlays
		*output = response
		return nil
	})
}

func monthsBetween(start, end time.Time) int {
	// Calculate the total number of months between the two dates
	yearsDiff := end.Year() - start.Year()
	monthsDiff := int(end.Month()) - int(start.Month())

	return yearsDiff*12 + monthsDiff
}
