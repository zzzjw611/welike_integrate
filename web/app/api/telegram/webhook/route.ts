import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getLatestIssue } from "@/lib/ai-marketer-news";
import {
  formatIssueForTelegram,
  sendTelegramMessage,
  type AlertSections,
} from "@/lib/news-telegram";

// Telegram → Vercel webhook. Receives every Update Telegram pushes for
// @WeLike_Alerts_bot and dispatches to a command handler.
//
// One-time setup (run once after deploying, see scripts/setup-telegram-webhook.sh):
//   curl -F "url=$WEB_BASE_URL/api/telegram/webhook" \
//        -F "secret_token=$TELEGRAM_WEBHOOK_SECRET" \
//        "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/setWebhook"
//
// Telegram then includes the secret in `X-Telegram-Bot-Api-Secret-Token`
// so we can reject forged Updates.

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const BASE_URL = process.env.WEB_BASE_URL || "https://welike-integrate.vercel.app";

interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    from?: { id: number; language_code?: string; first_name?: string };
    chat: { id: number };
    text?: string;
  };
}

// ─── helpers ────────────────────────────────────────────────────────────

async function reply(chatId: number, text: string) {
  await sendTelegramMessage(chatId, text);
}

function detectLang(code?: string): "en" | "zh" {
  return code?.startsWith("zh") ? "zh" : "en";
}

function authorize(req: NextRequest): boolean {
  const expected = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!expected) return true; // dev / not configured
  const got = req.headers.get("x-telegram-bot-api-secret-token");
  return got === expected;
}

// Ensure a `users` row exists; reuse the one already linked to this chat
// if one exists (e.g. from a prior /start), else mint a new one.
async function ensureUser(chatId: string, lang: "en" | "zh"): Promise<string> {
  const existing = await pool.query<{ user_id: string }>(
    `SELECT user_id FROM telegram_subscriptions WHERE telegram_chat_id = $1`,
    [chatId]
  );
  if (existing.rows.length > 0) return existing.rows[0].user_id;

  const inserted = await pool.query<{ id: string }>(
    `INSERT INTO users (language) VALUES ($1) RETURNING id`,
    [lang]
  );
  return inserted.rows[0].id;
}

async function ensureSubscription(
  userId: string,
  chatId: string,
  lang: "en" | "zh"
) {
  await pool.query(
    `INSERT INTO telegram_subscriptions
       (user_id, telegram_chat_id, language, timezone, push_time, is_active, updated_at)
     VALUES ($1, $2, $3, 'Asia/Shanghai', '09:00', true, NOW())
     ON CONFLICT (telegram_chat_id) DO UPDATE
       SET is_active = true, updated_at = NOW()`,
    [userId, chatId, lang]
  );
}

// ─── command handlers ──────────────────────────────────────────────────

const HELP_TEXT = `📚 <b>Commands</b>

/ainews — Today's top AI news
/social — Your Social Listening mentions
/list — See your alert configuration
/pause — Pause daily push
/resume — Resume daily push
/delete — Remove subscription entirely
/help — Show this menu

🌐 Manage from the web — easiest way
👉 ${BASE_URL}/tools/news · Create Alerts`;

function welcomeWithToolMenu(lang: "en" | "zh"): string {
  return lang === "zh"
    ? `✅ <b>已连接 WeLike 网站！</b>
你的 Telegram 已绑定。日报会自动推送到这里。

━━━━━━━━━━━━━━━━━━━━
🌐 <b>从网页管理（推荐）</b>
👉 ${BASE_URL}/tools/news  ·  Create Alerts
━━━━━━━━━━━━━━━━━━━━

<b>命令：</b>
  /ainews  → 今日 AI 新闻
  /social  → 你的 Social Listening 提及
  /list  → 查看你的告警
  /pause  /resume  /delete
  /help  → 全部命令`
    : `✅ <b>Connected to the WeLike website!</b>
Your Telegram is now linked. Pushes will land here automatically.

━━━━━━━━━━━━━━━━━━━━
🌐 <b>Manage from the web — easiest way</b>
👉 ${BASE_URL}/tools/news  ·  Create Alerts
━━━━━━━━━━━━━━━━━━━━

<b>Commands:</b>
  /ainews  → today's top AI news
  /social  → your Social Listening mentions
  /list  → see your alert
  /pause  /resume  /delete
  /help  → all commands`;
}

async function handleStart(
  chatId: number,
  lang: "en" | "zh",
  payload: string
) {
  const chatIdStr = String(chatId);
  const userId = await ensureUser(chatIdStr, lang);
  await ensureSubscription(userId, chatIdStr, lang);

  // If the user came via "?start=link_<token>" deep link, finish the bind.
  if (payload.startsWith("link_")) {
    const token = payload.slice(5);
    const upd = await pool.query(
      `UPDATE link_tokens
          SET telegram_chat_id = $1
        WHERE token = $2
          AND expires_at > NOW()
          AND telegram_chat_id IS NULL
        RETURNING token`,
      [chatIdStr, token]
    );
    if (upd.rowCount && upd.rowCount > 0) {
      await reply(chatId, welcomeWithToolMenu(lang));
      return;
    }
    await reply(
      chatId,
      lang === "zh"
        ? "⚠️ 链接已过期或已使用。请回到网站重新点 Connect。"
        : "⚠️ This link has expired or already been used. Please click Connect on the website again."
    );
    return;
  }

  // Plain /start (typed manually or from bot menu)
  await reply(chatId, welcomeWithToolMenu(lang));
}

async function handleAinews(chatId: number, lang: "en" | "zh") {
  const issue = await getLatestIssue();
  if (!issue) {
    await reply(
      chatId,
      lang === "zh"
        ? "今天还没有发布的日报。请明早再来。"
        : "No issue published yet. Check back tomorrow morning."
    );
    return;
  }
  // /ainews uses the user's saved sections preference if present, else default
  const subRow = await pool.query<{ sections: AlertSections | null }>(
    `SELECT sections FROM telegram_subscriptions WHERE telegram_chat_id = $1`,
    [String(chatId)]
  );
  const sections: AlertSections = subRow.rows[0]?.sections ?? {
    briefs: true,
    launches: true,
    growth_insights: true,
    daily_case: true,
  };
  await reply(chatId, formatIssueForTelegram(issue, sections));
}

async function handleSocial(chatId: number, lang: "en" | "zh") {
  await reply(
    chatId,
    lang === "zh"
      ? `🛠 <b>Social Listening 集成开发中</b>

请前往网页查看你的提及与告警：
👉 ${BASE_URL}/tools/social-listening`
      : `🛠 <b>Social Listening integration coming soon</b>

For now, view your mentions and alerts on the web:
👉 ${BASE_URL}/tools/social-listening`
  );
}

async function handleList(chatId: number, lang: "en" | "zh") {
  const { rows } = await pool.query<{
    is_active: boolean;
    push_time: string;
    timezone: string;
    sections: AlertSections | null;
    language: string;
  }>(
    `SELECT is_active,
            to_char(push_time, 'HH24:MI') AS push_time,
            timezone, sections, language
       FROM telegram_subscriptions
      WHERE telegram_chat_id = $1`,
    [String(chatId)]
  );

  if (rows.length === 0) {
    await reply(
      chatId,
      lang === "zh"
        ? "你还没有订阅。发送 /start 开始。"
        : "No subscription yet. Send /start to get started."
    );
    return;
  }
  const r = rows[0];
  const status = r.is_active ? "✅ Active" : "⏸ Paused";
  const sections = r.sections ?? {
    briefs: true,
    launches: true,
    growth_insights: true,
    daily_case: true,
  };
  const sectionsLabel = [
    sections.briefs && "Daily Brief",
    sections.launches && "Launch Radar",
    sections.growth_insights && "Growth Insights",
    sections.daily_case && "Daily Case",
  ]
    .filter(Boolean)
    .join(", ") || "(none)";

  await reply(
    chatId,
    `<b>Your alert</b>
Status: ${status}
Time: ${r.push_time} ${r.timezone}
Language: ${r.language}
Sections: ${sectionsLabel}

Manage on the web → ${BASE_URL}/tools/news`
  );
}

async function handlePause(chatId: number) {
  await pool.query(
    `UPDATE telegram_subscriptions
        SET is_active = false, updated_at = NOW()
      WHERE telegram_chat_id = $1`,
    [String(chatId)]
  );
  await reply(chatId, "⏸ Paused. Send /resume to start receiving again.");
}

async function handleResume(chatId: number) {
  await pool.query(
    `UPDATE telegram_subscriptions
        SET is_active = true, updated_at = NOW()
      WHERE telegram_chat_id = $1`,
    [String(chatId)]
  );
  await reply(chatId, "▶️ Resumed. You'll receive the next scheduled push.");
}

async function handleDelete(chatId: number) {
  await pool.query(
    `DELETE FROM telegram_subscriptions WHERE telegram_chat_id = $1`,
    [String(chatId)]
  );
  await reply(
    chatId,
    "🗑 Subscription removed. Send /start to subscribe again."
  );
}

async function handleHelp(chatId: number) {
  await reply(chatId, HELP_TEXT);
}

// ─── main dispatcher ───────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  if (!authorize(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let update: TelegramUpdate;
  try {
    update = await req.json();
  } catch {
    return NextResponse.json({ ok: true }); // ignore malformed
  }

  const msg = update.message;
  if (!msg?.text || !msg.from) {
    return NextResponse.json({ ok: true });
  }

  const chatId = msg.chat.id;
  const lang = detectLang(msg.from.language_code);
  const text = msg.text.trim();

  try {
    if (text.startsWith("/start")) {
      const payload = text.slice("/start".length).trim();
      await handleStart(chatId, lang, payload);
    } else if (text === "/ainews") {
      await handleAinews(chatId, lang);
    } else if (text === "/social") {
      await handleSocial(chatId, lang);
    } else if (text === "/list") {
      await handleList(chatId, lang);
    } else if (text === "/pause") {
      await handlePause(chatId);
    } else if (text === "/resume") {
      await handleResume(chatId);
    } else if (text === "/delete") {
      await handleDelete(chatId);
    } else if (text === "/help") {
      await handleHelp(chatId);
    }
    // Unknown commands and plain chat: silent (Telegram bots default behaviour).
  } catch (err) {
    console.error("[telegram:webhook] handler error", { text, chatId, err });
    // Tell Telegram OK regardless — otherwise it'll keep retrying the same
    // update and double-deliver replies once we recover.
  }

  // 200 within ~30s is the contract with Telegram. Always return ok.
  return NextResponse.json({ ok: true });
}
