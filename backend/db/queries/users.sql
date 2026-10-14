-- name: UsernameExists :one
SELECT COUNT(*) > 0
FROM user_account
WHERE LOWER(username) = LOWER($1);

-- name: GetUserUuidById :one
SELECT uuid
FROM user_account
WHERE id = $1;

-- name: GetMyAccount :one
SELECT uuid, created_at, updated_at, username, is_confirmed, is_blocked, profile_image_url
FROM user_account
WHERE id = $1;

-- name: CreateUserAccount :exec
INSERT INTO user_account (username, password_hash, is_confirmed, is_blocked)
VALUES ($1, $2, true, false);

-- name: GetUserProfileByUuid :one
SELECT id, uuid, created_at, username, profile_image_url
FROM user_account
WHERE uuid = $1;

-- name: GetUserProfileById :one
SELECT uuid, created_at, username, profile_image_url
FROM user_account
WHERE id = $1;

-- name: UpdateUserProfileImage :exec
UPDATE user_account
SET profile_image_url = $1
WHERE id = $2;
