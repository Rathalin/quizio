-- name: CreatePlayProtocolEntry :exec
INSERT INTO play_protocol_entry (quiz_id, user_account_id)
VALUES (@quiz_id, @user_account_id::bigint);

-- name: CreatePublicPlayProtocolEntry :exec
INSERT INTO play_protocol_entry (quiz_id)
VALUES ($1);

-- name: GetPlayProtocolEntriesByDateRange :many
SELECT TO_CHAR(played_at, 'YYYY-MM-DD')::text AS entry_date, COUNT(*)::bigint AS play_count
FROM play_protocol_entry
WHERE quiz_id = @quiz_id
  AND played_at >= sqlc.arg(start_date)::timestamp 
  AND played_at < (sqlc.arg(end_date)::timestamp + INTERVAL '1 day')
  AND played_at != sqlc.arg(migration_date)::timestamp
GROUP BY entry_date
ORDER BY entry_date;

-- name: GetMigratedPlayCount :one
SELECT COUNT(*)::bigint
FROM play_protocol_entry
WHERE quiz_id = $1
  AND played_at = $2;
