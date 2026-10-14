BEGIN;

DROP INDEX IF EXISTS idx_refresh_token_token;
DROP INDEX IF EXISTS idx_play_protocol_entry_quiz_id;
DROP INDEX IF EXISTS idx_answer_question_id;
DROP INDEX IF EXISTS idx_question_quiz_id;
DROP INDEX IF EXISTS idx_quiz_user_account_id;

CREATE INDEX IF NOT EXISTS idx_user_account_uuid ON user_account(uuid);
CREATE INDEX IF NOT EXISTS idx_quiz_uuid ON quiz(uuid);

COMMIT;

