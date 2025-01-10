-- init.pgsql

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Drop and recreate the database
-- DROP DATABASE IF EXISTS quizio;
-- CREATE DATABASE quizio;

-- Drop tables
DROP TABLE IF EXISTS alert;
DROP TABLE IF EXISTS play_protocol_entry;
DROP TABLE IF EXISTS answer;
DROP TABLE IF EXISTS question;
DROP TABLE IF EXISTS quiz;
DROP TABLE IF EXISTS user_account;

-- Connect to the new database (if running interactively)
-- \c quizio;

-- Create tables
CREATE TABLE IF NOT EXISTS user_account (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  password_salt TEXT NOT NULL,
  is_confirmed BOOLEAN NOT NULL,
  is_blocked BOOLEAN NOT NULL,
  profile_image_url TEXT
);

CREATE TABLE IF NOT EXISTS quiz (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description_text TEXT,
  is_published BOOLEAN NOT NULL,
  image_url TEXT,
  user_account_id BIGINT NOT NULL REFERENCES user_account(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS question (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  title TEXT NOT NULL, 
  description_text TEXT,
  image_url TEXT,
  explanation TEXT,
  explanation_image_url TEXT,
  quiz_id BIGINT NOT NULL REFERENCES quiz(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS answer (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  title TEXT NOT NULL,
  description_text TEXT,
  image_url TEXT,
  is_correct BOOLEAN NOT NULL,
  question_id BIGINT NOT NULL REFERENCES question(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS play_protocol_entry (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  played_at TIMESTAMP NOT NULL DEFAULT NOW(),
  quiz_id BIGINT NOT NULL REFERENCES quiz(id) ON DELETE CASCADE,
  user_account_id BIGINT REFERENCES user_account(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS alert (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  markdown_content TEXT NOT NULL,
  severity TEXT NOT NULL,
  image_url TEXT,
  image_size TEXT,
  is_active BOOLEAN NOT NULL
);

-- Create indexes for uuid columns
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_account_uuid ON user_account(uuid);
CREATE UNIQUE INDEX IF NOT EXISTS idx_quiz_uuid ON quiz(uuid);
