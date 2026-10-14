BEGIN;

-- Repair alert sequence (prevent primary key collisions on next INSERT)
SELECT setval(pg_get_serial_sequence('alert', 'id'), COALESCE(MAX(id), 0) + 1, false) FROM alert;

-- Restore update trigger dropped when table was rebuilt in migration 3
DROP TRIGGER IF EXISTS set_updated_at_alert ON alert;
CREATE TRIGGER set_updated_at_alert BEFORE UPDATE ON alert
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Foreign key indexes (accelerate joins, filters, and cascading deletes)
CREATE INDEX IF NOT EXISTS idx_quiz_user_account_id ON quiz(user_account_id);
CREATE INDEX IF NOT EXISTS idx_question_quiz_id ON question(quiz_id);
CREATE INDEX IF NOT EXISTS idx_answer_question_id ON answer(question_id);
CREATE INDEX IF NOT EXISTS idx_play_protocol_entry_quiz_id ON play_protocol_entry(quiz_id, played_at);
CREATE INDEX IF NOT EXISTS idx_refresh_token_token ON refresh_token(token);

-- Drop duplicate indexes (unique constraints already create unique indexes on uuid)
DROP INDEX IF EXISTS idx_user_account_uuid;
DROP INDEX IF EXISTS idx_quiz_uuid;

COMMIT;

