-- 002_news_push.sql
-- Adds Create Alerts → daily Telegram push closed loop.
-- See plan: ai-marketer-news-main-welike-done-ai-mar-memoized-dragonfly.md (Phase 4).

-- ── telegram_subscriptions: which sections + last-update tracking ─────────
ALTER TABLE telegram_subscriptions
  ADD COLUMN IF NOT EXISTS sections JSONB NOT NULL
    DEFAULT '{"briefs":true,"launches":true,"growth_insights":true,"daily_case":true}',
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE INDEX IF NOT EXISTS telegram_subscriptions_active_push_time
  ON telegram_subscriptions (is_active, push_time);

-- ── news_push_log: idempotency for the hourly cron dispatcher ────────────
-- Same chat_id × same issue_date pair is sent at most once. The cron handler
-- INSERTs with ON CONFLICT DO NOTHING; if 0 rows are affected the chat already
-- got today's push so we skip the Telegram API call.
CREATE TABLE IF NOT EXISTS news_push_log (
  telegram_chat_id VARCHAR(100) NOT NULL,
  issue_date       DATE         NOT NULL,
  sent_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  PRIMARY KEY (telegram_chat_id, issue_date)
);

CREATE INDEX IF NOT EXISTS news_push_log_sent_at
  ON news_push_log (sent_at DESC);
