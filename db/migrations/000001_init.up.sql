BEGIN;

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE DATABASE quizio;

-- Switch database
\c quizio

-- Create tables
CREATE TABLE IF NOT EXISTS user_account (
  id BIGSERIAL PRIMARY KEY,
  uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  is_confirmed BOOLEAN NOT NULL,
  is_blocked BOOLEAN NOT NULL,
  profile_image_url TEXT
);

CREATE TABLE IF NOT EXISTS refresh_token (
  id BIGSERIAL PRIMARY KEY,
  user_account_id BIGINT REFERENCES user_account(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  UNIQUE (user_account_id, token)
);

CREATE TABLE IF NOT EXISTS quiz (
  id BIGSERIAL PRIMARY KEY,
  uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  title TEXT NOT NULL,
  description_text TEXT,
  is_published BOOLEAN NOT NULL,
  image_url TEXT,
  user_account_id BIGINT NOT NULL REFERENCES user_account(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS question (
  id BIGSERIAL PRIMARY KEY,
  uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  order_index INT NOT NULL DEFAULT 0,
  title TEXT NOT NULL, 
  description_text TEXT,
  image_url TEXT,
  explanation TEXT,
  explanation_image_url TEXT,
  quiz_id BIGINT NOT NULL REFERENCES quiz(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS answer (
  id BIGSERIAL PRIMARY KEY,
  uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  order_index INT NOT NULL DEFAULT 0,
  title TEXT NOT NULL,
  description_text TEXT,
  image_url TEXT,
  is_correct BOOLEAN NOT NULL,
  question_id BIGINT NOT NULL REFERENCES question(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS play_protocol_entry (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  played_at TIMESTAMP NOT NULL DEFAULT NOW(),
  quiz_id BIGINT NOT NULL REFERENCES quiz(id) ON DELETE CASCADE,
  user_account_id BIGINT REFERENCES user_account(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS alert (
  id BIGSERIAL PRIMARY KEY,
  uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  order_index INT NOT NULL DEFAULT 0,
  markdown_content TEXT NOT NULL,
  severity TEXT NOT NULL,
  image_url TEXT,
  image_size TEXT,
  is_active BOOLEAN NOT NULL
);

-- Create indexes for uuid columns
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_account_uuid ON user_account(uuid);
CREATE UNIQUE INDEX IF NOT EXISTS idx_quiz_uuid ON quiz(uuid);


-- Create triggers to auto-update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER set_updated_at_alert
BEFORE UPDATE ON alert
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_play_protocol_entry
BEFORE UPDATE ON play_protocol_entry
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_answer
BEFORE UPDATE ON answer
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_question
BEFORE UPDATE ON question
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_quiz
BEFORE UPDATE ON quiz
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_user_account
BEFORE UPDATE ON user_account
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

COMMIT;
