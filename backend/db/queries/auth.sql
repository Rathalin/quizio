-- name: GetUserSignInData :one
SELECT id, password_hash, uuid, is_blocked, is_confirmed
FROM user_account
WHERE LOWER(username) = LOWER($1);

-- name: CreateRefreshToken :exec
INSERT INTO refresh_token (user_account_id, token, expires_at)
VALUES (@user_account_id::bigint, @token, @expires_at);

-- name: GetUserIdByRefreshToken :one
SELECT rt.user_account_id::bigint AS user_account_id
FROM refresh_token rt
JOIN user_account ua ON rt.user_account_id = ua.id
WHERE rt.token = $1 
  AND rt.expires_at > NOW() 
  AND ua.is_blocked = false 
  AND ua.is_confirmed = true;

-- name: DeleteRefreshToken :exec
DELETE FROM refresh_token
WHERE token = $1;

-- name: DeleteRefreshTokensByUserId :exec
DELETE FROM refresh_token
WHERE user_account_id = $1::bigint;

-- name: GetPasswordHashById :one
SELECT password_hash
FROM user_account
WHERE id = $1;

-- name: UpdatePasswordHash :exec
UPDATE user_account
SET password_hash = $1
WHERE id = $2;
