BEGIN;

-- Drop triggers
DROP TRIGGER IF EXISTS set_updated_at_alert ON alert;
DROP TRIGGER IF EXISTS set_updated_at_play_protocol_entry ON play_protocol_entry;
DROP TRIGGER IF EXISTS set_updated_at_answer ON answer;
DROP TRIGGER IF EXISTS set_updated_at_question ON question;
DROP TRIGGER IF EXISTS set_updated_at_quiz ON quiz;
DROP TRIGGER IF EXISTS set_updated_at_user_account ON user_account;

-- Drop trigger function
DROP FUNCTION IF EXISTS update_updated_at_column;

-- Drop indexes
DROP INDEX IF EXISTS idx_user_account_uuid;
DROP INDEX IF EXISTS idx_quiz_uuid;

-- Drop tables in reverse order to avoid foreign key conflicts
DROP TABLE IF EXISTS alert;
DROP TABLE IF EXISTS play_protocol_entry;
DROP TABLE IF EXISTS answer;
DROP TABLE IF EXISTS question;
DROP TABLE IF EXISTS quiz;
DROP TABLE IF EXISTS refresh_token;
DROP TABLE IF EXISTS user_account;

-- Drop database (optional, remove if database should persist)
DROP DATABASE IF EXISTS quizio;

-- Drop extension (optional, keep if used elsewhere)
DROP EXTENSION IF EXISTS pgcrypto;

COMMIT;
