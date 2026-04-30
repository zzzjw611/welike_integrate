-- AI Marketer Daily — Database Schema (PRD 12.2)

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── articles ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS articles (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date             DATE        NOT NULL,
  section          VARCHAR(20) NOT NULL
    CHECK (section IN ('daily_brief','growth_insight','launch_radar','daily_case')),
  order_in_section INTEGER     NOT NULL DEFAULT 0,
  title_en         TEXT        NOT NULL,
  title_zh         TEXT        NOT NULL,
  content_en       TEXT        NOT NULL,
  content_zh       TEXT        NOT NULL,
  so_what_en       TEXT,
  so_what_zh       TEXT,
  sources          JSONB       NOT NULL DEFAULT '[]',
  extra            JSONB       NOT NULL DEFAULT '{}',
  published_at     TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Idempotent migration for existing installations
ALTER TABLE articles ADD COLUMN IF NOT EXISTS extra JSONB NOT NULL DEFAULT '{}';

CREATE INDEX IF NOT EXISTS articles_date_section
  ON articles (date DESC, section, order_in_section);

-- ── users ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email      VARCHAR(255),
  language   VARCHAR(5) NOT NULL DEFAULT 'en'
    CHECK (language IN ('en','zh')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── telegram_subscriptions ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS telegram_subscriptions (
  user_id          UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  telegram_chat_id VARCHAR(100) NOT NULL,
  language         VARCHAR(5)  NOT NULL DEFAULT 'zh'
    CHECK (language IN ('en','zh')),
  timezone         VARCHAR(50) NOT NULL DEFAULT 'Asia/Shanghai',
  push_time        TIME        NOT NULL DEFAULT '09:00',
  is_active        BOOLEAN     NOT NULL DEFAULT TRUE,
  PRIMARY KEY (telegram_chat_id)
);

-- ── content_candidates ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS content_candidates (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_url       TEXT        NOT NULL,
  raw_content      TEXT        NOT NULL,
  ai_score         JSONB       NOT NULL DEFAULT
    '{"impact":0,"novelty":0,"actionability":0,"heat":0}',
  suggested_section VARCHAR(20)
    CHECK (suggested_section IN
      ('daily_brief','growth_insight','launch_radar','daily_case')),
  ai_draft_en      TEXT        NOT NULL DEFAULT '',
  status           VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','approved','rejected','published')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS candidates_status_section
  ON content_candidates (status, suggested_section, (ai_score->>'impact') DESC);
