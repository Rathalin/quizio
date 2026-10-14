-- name: GetAlerts :many
SELECT uuid, created_at, updated_at, markdown_de, markdown_en, severity, image_url, image_size, is_active, visible_to
FROM alert
WHERE is_active 
  AND (visible_to = 'everyone' OR visible_to = $1)
ORDER BY order_index ASC;
