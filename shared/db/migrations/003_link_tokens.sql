-- 003_link_tokens.sql
-- One-time tokens used by the Create Alerts → Telegram auto-link flow.
--
-- Flow:
--   1. User clicks "Connect with @WeLike_Alerts_bot" on the website
--   2. POST /api/social-listening/alerts/link/start
--        → INSERT INTO link_tokens (token) VALUES (random)
--        → returns deep_link "https://t.me/WeLike_Alerts_bot?start=link_<token>"
--   3. User clicks deep_link → Telegram opens → user sends "/start link_<token>"
--   4. Telegram POSTs to our webhook /api/telegram/webhook
--        → UPDATE link_tokens SET telegram_chat_id = <chat_id> WHERE token = <token>
--   5. Frontend polls /api/social-listening/alerts/link/status?token=<token>
--        → SELECT telegram_chat_id FROM link_tokens WHERE token = <token>
--        → returns { linked: true, chat_id }
--
-- Tokens expire after 15 minutes (frontend polls for ~10 minutes).

CREATE TABLE IF NOT EXISTS link_tokens (
  token            VARCHAR(64)  PRIMARY KEY,
  telegram_chat_id VARCHAR(100),                       -- NULL until /start link_xxx
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  expires_at       TIMESTAMPTZ  NOT NULL DEFAULT (NOW() + INTERVAL '15 minutes')
);

CREATE INDEX IF NOT EXISTS link_tokens_expires_at
  ON link_tokens (expires_at);
