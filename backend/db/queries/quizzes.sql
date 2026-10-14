-- name: GetTotalPublishedQuizCount :one
SELECT COUNT(*)::bigint
FROM quiz
WHERE is_published = true;

-- name: GetTotalQuizzesCreatedByUser :one
SELECT COUNT(*)::bigint
FROM quiz
WHERE user_account_id = $1;

-- name: GetTotalQuizzesPlayCountByUser :one
SELECT COUNT(*)::bigint
FROM play_protocol_entry e
JOIN quiz q ON q.id = e.quiz_id
WHERE q.user_account_id = $1;

-- name: GetSeoPublishedQuizzesUuids :many
SELECT uuid
FROM quiz
WHERE is_published = true;

-- name: GetQuizIdByUuid :one
SELECT id
FROM quiz
WHERE uuid = $1;

-- name: GetQuizImageUrlForUser :one
SELECT image_url
FROM quiz
WHERE uuid = $1 AND user_account_id = $2;

-- name: GetQuizQuestionImages :many
SELECT qn.image_url, qn.explanation_image_url
FROM question qn
JOIN quiz q ON qn.quiz_id = q.id
WHERE q.uuid = $1;

-- name: GetQuizAnswerImages :many
SELECT a.image_url
FROM answer a
JOIN question qn ON a.question_id = qn.id
JOIN quiz q ON qn.quiz_id = q.id
WHERE q.uuid = $1 AND a.image_url IS NOT NULL;

-- name: DeleteQuizForUser :exec
DELETE FROM quiz
WHERE uuid = $1 AND user_account_id = $2;

-- name: UpdateQuizVisibility :one
UPDATE quiz
SET is_published = $1
WHERE uuid = $2 AND user_account_id = $3
RETURNING id;

-- name: GetQuizzes :many
SELECT 
    q.uuid, 
    q.created_at, 
    q.updated_at, 
    q.title, 
    COALESCE(q.description_text, '') AS description, 
    q.is_published, 
    q.image_url, 
    u.uuid AS user_uuid, 
    u.username, 
    COUNT(DISTINCT qn.id)::bigint AS question_count,
    COUNT(DISTINCT pe.id)::bigint AS play_count
FROM quiz q
JOIN user_account u ON u.id = q.user_account_id
LEFT JOIN question qn ON qn.quiz_id = q.id
LEFT JOIN play_protocol_entry pe ON pe.quiz_id = q.id
WHERE q.is_published
GROUP BY 
    q.uuid, q.created_at, q.updated_at, q.title, 
    COALESCE(q.description_text, ''), q.is_published, q.image_url, 
    u.uuid, u.username
ORDER BY 
    CASE WHEN @sort_option::text = 'createdAt' AND @sort_direction::text = 'asc' THEN q.created_at END ASC,
    CASE WHEN @sort_option::text = 'createdAt' AND @sort_direction::text = 'desc' THEN q.created_at END DESC,
    CASE WHEN @sort_option::text = 'playCount' AND @sort_direction::text = 'asc' THEN COUNT(DISTINCT pe.id) END ASC,
    CASE WHEN @sort_option::text = 'playCount' AND @sort_direction::text = 'desc' THEN COUNT(DISTINCT pe.id) END DESC,
    q.uuid ASC
LIMIT $1
OFFSET $2;

-- name: GetMyQuizzes :many
SELECT
    q.id,
    q.uuid,
    q.created_at,
    q.updated_at,
    q.title,
    COALESCE(q.description_text, '') AS description,
    q.is_published,
    q.image_url,
    COUNT(DISTINCT qn.id)::bigint AS question_count,
    COUNT(DISTINCT pe.id)::bigint AS play_count
FROM quiz q
JOIN user_account u ON u.id = q.user_account_id
LEFT JOIN question qn ON qn.quiz_id = q.id
LEFT JOIN play_protocol_entry pe ON pe.quiz_id = q.id
WHERE q.user_account_id = $1
GROUP BY
    q.id, q.uuid, q.created_at, q.updated_at, q.title,
    COALESCE(q.description_text, ''), q.is_published, q.image_url,
    u.uuid, u.username
ORDER BY 
    CASE WHEN @sort_option::text = 'createdAt' AND @sort_direction::text = 'asc' THEN q.created_at END ASC,
    CASE WHEN @sort_option::text = 'createdAt' AND @sort_direction::text = 'desc' THEN q.created_at END DESC,
    CASE WHEN @sort_option::text = 'playCount' AND @sort_direction::text = 'asc' THEN COUNT(DISTINCT pe.id) END ASC,
    CASE WHEN @sort_option::text = 'playCount' AND @sort_direction::text = 'desc' THEN COUNT(DISTINCT pe.id) END DESC,
    q.uuid ASC;

-- name: GetMyQuizTrendsHeader :one
SELECT
    q.id,
    q.created_at,
    q.updated_at,
    q.title,
    COALESCE(q.description_text, '') AS description,
    q.is_published,
    q.image_url,
    COUNT(DISTINCT qn.id)::bigint AS question_count,
    COUNT(DISTINCT pe.id)::bigint AS play_count
FROM quiz q
JOIN user_account u ON u.id = q.user_account_id
LEFT JOIN question qn ON qn.quiz_id = q.id
LEFT JOIN play_protocol_entry pe ON pe.quiz_id = q.id
WHERE q.uuid = $1 AND q.user_account_id = $2
GROUP BY
    q.id, q.uuid, q.created_at, q.updated_at, q.title,
    COALESCE(q.description_text, ''), q.is_published, q.image_url,
    u.uuid, u.username;

-- name: GetQuizForPlaying :many
SELECT
    q.id AS quiz_id,
    q.title AS quiz_title,
    q.image_url AS quiz_image_url,
    qn.id AS question_id,
    qn.uuid AS question_uuid,
    qn.created_at AS question_created_at,
    qn.updated_at AS question_updated_at,
    qn.order_index AS question_order_index,
    qn.title AS question_title,
    COALESCE(qn.description_text, '') AS question_description,
    qn.image_url AS question_image_url,
    qn.explanation AS question_explanation,
    qn.explanation_image_url AS question_explanation_image_url,
    a.id AS answer_id,
    a.uuid AS answer_uuid,
    a.created_at AS answer_created_at,
    a.updated_at AS answer_updated_at,
    a.order_index AS answer_order_index,
    a.title AS answer_title,
    COALESCE(a.description_text, '') AS answer_description,
    a.image_url AS answer_image_url,
    a.is_correct AS answer_is_correct
FROM quiz q
JOIN question qn ON q.id = qn.quiz_id
JOIN answer a ON qn.id = a.question_id
WHERE q.uuid = $1
ORDER BY qn.order_index ASC, a.order_index ASC;

-- name: GetMyQuizForEditing :many
SELECT
    q.id AS quiz_id,
    q.title AS quiz_title,
    COALESCE(q.description_text, '') AS quiz_description,
    q.is_published AS quiz_is_published,
    q.image_url AS quiz_image_url,
    qn.id AS question_id,
    qn.uuid AS question_uuid,
    qn.created_at AS question_created_at,
    qn.updated_at AS question_updated_at,
    qn.order_index AS question_order_index,
    qn.title AS question_title,
    COALESCE(qn.description_text, '') AS question_description,
    qn.image_url AS question_image_url,
    qn.explanation AS question_explanation,
    qn.explanation_image_url AS question_explanation_image_url,
    a.id AS answer_id,
    a.uuid AS answer_uuid,
    a.created_at AS answer_created_at,
    a.updated_at AS answer_updated_at,
    a.order_index AS answer_order_index,
    a.title AS answer_title,
    COALESCE(a.description_text, '') AS answer_description,
    a.image_url AS answer_image_url,
    a.is_correct AS answer_is_correct
FROM quiz q
JOIN question qn ON q.id = qn.quiz_id
JOIN answer a ON qn.id = a.question_id
WHERE q.uuid = $1 AND q.user_account_id = $2
ORDER BY qn.order_index ASC, a.order_index ASC;

-- name: CreateQuiz :one
INSERT INTO quiz (title, description_text, is_published, image_url, user_account_id)
VALUES ($1, $2, $3, $4, $5)
RETURNING id;

-- name: CreateQuestion :one
INSERT INTO question (order_index, title, description_text, image_url, explanation, explanation_image_url, quiz_id)
VALUES ($1, $2, $3, $4, $5, $6, $7)
RETURNING id;

-- name: CreateAnswer :exec
INSERT INTO answer (order_index, title, description_text, image_url, is_correct, question_id)
VALUES ($1, $2, $3, $4, $5, $6);

-- name: UpdateQuizDetails :one
UPDATE quiz
SET title = $1, description_text = $2, is_published = $3, image_url = $4
WHERE uuid = $5 AND user_account_id = $6
RETURNING id;

-- name: GetQuestionUuidsByQuizId :many
SELECT uuid
FROM question
WHERE quiz_id = $1;

-- name: UpdateQuestion :one
UPDATE question
SET order_index = $1, title = $2, description_text = $3, image_url = $4, explanation = $5, explanation_image_url = $6
WHERE uuid = $7
RETURNING id;

-- name: GetAnswerUuidsByQuestionId :many
SELECT uuid
FROM answer
WHERE question_id = $1;

-- name: UpdateAnswer :exec
UPDATE answer
SET order_index = $1, title = $2, description_text = $3, image_url = $4, is_correct = $5
WHERE uuid = $6;

-- name: DeleteAnswerByUuid :exec
DELETE FROM answer 
WHERE uuid = $1;

-- name: DeleteQuestionByUuid :exec
DELETE FROM question 
WHERE uuid = $1;
