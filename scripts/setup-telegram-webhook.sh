#!/usr/bin/env bash
# One-time bootstrap: tell Telegram to push every Update for @WeLike_Alerts_bot
# to our Vercel webhook endpoint. Uses TELEGRAM_WEBHOOK_SECRET so we can verify
# subsequent requests aren't forged.
#
# Usage:
#   export TELEGRAM_BOT_TOKEN=...           # from @BotFather
#   export TELEGRAM_WEBHOOK_SECRET=...      # any random 32-byte hex
#   export WEB_BASE_URL=https://welike-integrate.vercel.app
#   ./scripts/setup-telegram-webhook.sh
#
# Safe to re-run; setWebhook is idempotent. Run again whenever you change
# TELEGRAM_WEBHOOK_SECRET or move to a new domain.

set -euo pipefail

: "${TELEGRAM_BOT_TOKEN:?Missing TELEGRAM_BOT_TOKEN}"
: "${TELEGRAM_WEBHOOK_SECRET:?Missing TELEGRAM_WEBHOOK_SECRET}"
: "${WEB_BASE_URL:?Missing WEB_BASE_URL}"

WEBHOOK_URL="${WEB_BASE_URL%/}/api/telegram/webhook"

echo "→ Registering webhook: $WEBHOOK_URL"
# `callback_query` is required — tapping inline-keyboard buttons in the
# menu (📰 AI News, 📋 Daily Brief, etc.) sends a callback_query update.
# Without it Telegram silently drops button taps and the menu appears dead.
RESP=$(curl -sS \
  --data-urlencode "url=$WEBHOOK_URL" \
  --data-urlencode "secret_token=$TELEGRAM_WEBHOOK_SECRET" \
  --data-urlencode 'allowed_updates=["message","callback_query"]' \
  --data-urlencode "drop_pending_updates=true" \
  "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook")

echo "$RESP"

if ! echo "$RESP" | grep -q '"ok":true'; then
  echo "❌ setWebhook failed" >&2
  exit 1
fi

echo
echo "→ Verifying with getWebhookInfo:"
curl -sS "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getWebhookInfo" \
  | tr ',' '\n'

echo
echo "✅ Done. Test by sending /start to @WeLike_Alerts_bot in Telegram."
