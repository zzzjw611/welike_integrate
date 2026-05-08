import { NextRequest, NextResponse } from "next/server";
import { getLatestIssue } from "@/lib/ai-marketer-news";
import {
  formatIssueForTelegram,
  type AlertSections,
} from "@/lib/news-telegram";
import { upsertUser } from "@/lib/social-listening/db";
import {
  cmdTrack,
  cmdList,
  cmdToggle,
  cmdDelete,
  cmdSentiment,
  cmdUrgency,
  cmdDigest,
  cmdTimezone,
  cmdRun,
  cmdFetchSocialSummary,
  handleStartToken,
} from "@/lib/social-listening/telegram-commands";

// Single-bot stateless interactive webhook for @WeLike_Alerts_bot.
//
// Two surfaces share the same Telegram bot:
//   1. AI News (existing): pull mode — /ainews, /start menu, callback buttons
//      m:ai*, m:soc, m:root.
//   2. Social Listening (new): stateful — /track, /list, /sentiment,
//      /urgency, /digest, /timezone, /run, /pause, /resume, /delete.
//      /start <token>  binds a website session to this chat (Web Link flow).
//
// Both surfaces dispatch off the same incoming Update payload. The webhook
// stays Vercel-serverless friendly (no long-running scheduler) — Smart
// Alerts polling is handled by /api/social-listening/cron/poll-alerts.
//
// Webhook bootstrap (one-time): scripts/setup-telegram-webhook.sh
// Telegram echoes our TELEGRAM_WEBHOOK_SECRET in the
// X-Telegram-Bot-Api-Secret-Token header so we can reject forgeries.

export const dynamic = "force-dynamic";
export const maxDuration = 60;
export const runtime = "nodejs";

const BASE_URL =
  process.env.WEB_URL ||
  process.env.WEB_BASE_URL ||
  "https://welike-integrate.vercel.app";
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

// ─── types ─────────────────────────────────────────────────────────────

interface InlineKeyboardButton {
  text: string;
  callback_data?: string;
  url?: string;
}
interface InlineKeyboardMarkup {
  inline_keyboard: InlineKeyboardButton[][];
}
interface TelegramMessage {
  message_id: number;
  from?: {
    id: number;
    username?: string;
    first_name?: string;
    language_code?: string;
  };
  chat: { id: number; type?: string };
  text?: string;
}
interface TelegramCallbackQuery {
  id: string;
  from: {
    id: number;
    username?: string;
    first_name?: string;
    language_code?: string;
  };
  message?: TelegramMessage;
  data?: string;
}
interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
  callback_query?: TelegramCallbackQuery;
}

type Lang = "en" | "zh";

// ─── Telegram API helpers ──────────────────────────────────────────────

async function tg(method: string, body: unknown) {
  if (!BOT_TOKEN) {
    console.error("[webhook] TELEGRAM_BOT_TOKEN missing");
    return;
  }
  try {
    const res = await fetch(`${TELEGRAM_API}/${method}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      console.error(`[webhook] ${method} failed`, res.status, await res.text());
    }
  } catch (err) {
    console.error(`[webhook] ${method} threw`, err);
  }
}

function sendMessage(
  chatId: number,
  text: string,
  reply_markup?: InlineKeyboardMarkup
) {
  return tg("sendMessage", {
    chat_id: chatId,
    text,
    parse_mode: "HTML",
    disable_web_page_preview: true,
    ...(reply_markup ? { reply_markup } : {}),
  });
}

function editMessageText(
  chatId: number,
  messageId: number,
  text: string,
  reply_markup?: InlineKeyboardMarkup
) {
  return tg("editMessageText", {
    chat_id: chatId,
    message_id: messageId,
    text,
    parse_mode: "HTML",
    disable_web_page_preview: true,
    ...(reply_markup ? { reply_markup } : {}),
  });
}

function answerCallback(callbackId: string, text?: string) {
  return tg("answerCallbackQuery", {
    callback_query_id: callbackId,
    ...(text ? { text, show_alert: false } : {}),
  });
}

// ─── menus ─────────────────────────────────────────────────────────────

const T = {
  welcome: {
    en: `👋 <b>Welcome to @WeLike_Alerts_bot</b>
I send push notifications from your WeLike tools — set everything up on the website:

━━━━━━━━━━━━━━━━━━━━
🌐 <b>Manage from the web — easiest way</b>
👉 ${BASE_URL}/tools/social-listening  ·  Create Alerts
━━━━━━━━━━━━━━━━━━━━

<b>Commands:</b>
  /ainews  → today's top AI news
  /social  → your Social Listening mentions
  /track @handle  → start tracking
  /list  /pause  /resume  /delete
  /sentiment /urgency /digest /timezone
  /help  → all commands`,
    zh: `👋 <b>欢迎使用 @WeLike_Alerts_bot</b>
我会把 WeLike 各工具的推送送达给你 —— 推荐在网页端管理：

━━━━━━━━━━━━━━━━━━━━
🌐 <b>从网页管理（推荐）</b>
👉 ${BASE_URL}/tools/social-listening  ·  Create Alerts
━━━━━━━━━━━━━━━━━━━━

<b>命令：</b>
  /ainews  → 今日 AI 要闻
  /social  → 你的社交聆听提及
  /track @handle  → 开始监测
  /list  /pause  /resume  /delete
  /sentiment /urgency /digest /timezone
  /help  → 全部命令`,
  },
  aiNewsHeader: {
    en: `📰 <b>AI Marketer News</b>

Pick a section:`,
    zh: `📰 <b>AI Marketer News</b>

选择一个板块：`,
  },
  noIssue: {
    en: `📭 No issue published yet. Check back tomorrow morning.`,
    zh: `📭 今天还没发布日报，明早再来看吧。`,
  },
  help: {
    en: `📚 <b>All Commands</b>

🌐 ${BASE_URL}/tools/social-listening

/ainews → today's top AI news
/social → your Social Listening mentions
/track <handle/keyword…> → create an alert (e.g. /track @StableStock tesla)
/list   → show your alert
/sentiment <all|csv> → filter by sentiment (e.g. /sentiment negative,neutral)
/urgency <all|csv>   → filter by urgency (e.g. /urgency high,medium)
/digest <on|off>     → batch ≥5 hits/poll into a single summary
/timezone <IANA>     → set your tz (e.g. Asia/Shanghai)
/run    → poll your alert right now
/pause  → pause pushes
/resume → resume pushes
/delete → delete the alert
/help   → this menu`,
    zh: `📚 <b>全部命令</b>

🌐 ${BASE_URL}/tools/social-listening

/ainews → 今日 AI 要闻
/social → 你的社交聆听提及
/track <handle/关键词…> → 创建 alert（例：/track @StableStock tesla）
/list   → 查看你的 alert
/sentiment <all|csv> → 情感过滤（例：/sentiment negative,neutral）
/urgency <all|csv>   → 紧急度过滤（例：/urgency high,medium）
/digest <on|off>     → 单次轮询 ≥5 条时合并为摘要
/timezone <IANA>     → 设置时区（例：Asia/Shanghai）
/run    → 立即运行一次
/pause  → 暂停推送
/resume → 恢复推送
/delete → 删除 alert
/help   → 显示此菜单`,
  },
};

function detectLang(code?: string): Lang {
  return code?.startsWith("zh") ? "zh" : "en";
}

function mainMenuMarkup(lang: Lang): InlineKeyboardMarkup {
  return {
    inline_keyboard: [
      [
        {
          text: "📰 AI News",
          callback_data: "m:ai",
        },
      ],
      [
        {
          text: "📡 Social Listening",
          callback_data: "m:soc",
        },
      ],
      [
        {
          text: lang === "zh" ? "📋 我的 alert" : "📋 My alert",
          callback_data: "m:list",
        },
      ],
    ],
  };
}

function aiSectionsMarkup(lang: Lang): InlineKeyboardMarkup {
  const labels = {
    en: ["📋 Daily Brief", "💡 Growth Insight", "🚀 Launch Radar", "📊 Daily Case", "✨ All", "← Back"],
    zh: ["📋 Daily Brief", "💡 Growth Insight", "🚀 Launch Radar", "📊 Daily Case", "✨ 全部", "← 返回"],
  };
  const L = lang === "zh" ? labels.zh : labels.en;
  return {
    inline_keyboard: [
      [{ text: L[0], callback_data: "m:ai:b" }],
      [{ text: L[1], callback_data: "m:ai:g" }],
      [{ text: L[2], callback_data: "m:ai:l" }],
      [{ text: L[3], callback_data: "m:ai:c" }],
      [{ text: L[4], callback_data: "m:ai:all" }],
      [{ text: L[5], callback_data: "m:root" }],
    ],
  };
}

function sectionsForKey(key: string): AlertSections {
  switch (key) {
    case "b":
      return { briefs: true, launches: false, growth_insights: false, daily_case: false };
    case "g":
      return { briefs: false, launches: false, growth_insights: true, daily_case: false };
    case "l":
      return { briefs: false, launches: true, growth_insights: false, daily_case: false };
    case "c":
      return { briefs: false, launches: false, growth_insights: false, daily_case: true };
    case "all":
    default:
      return { briefs: true, launches: true, growth_insights: true, daily_case: true };
  }
}

// ─── handlers ──────────────────────────────────────────────────────────

async function showMainMenu(chatId: number, lang: Lang) {
  await sendMessage(chatId, T.welcome[lang], mainMenuMarkup(lang));
}

async function showAiSections(chatId: number, lang: Lang) {
  await sendMessage(chatId, T.aiNewsHeader[lang], aiSectionsMarkup(lang));
}

async function sendIssueSection(chatId: number, lang: Lang, sectionKey: string) {
  const issue = await getLatestIssue();
  if (!issue) {
    await sendMessage(chatId, T.noIssue[lang]);
    return;
  }
  const sections = sectionsForKey(sectionKey);
  const text = formatIssueForTelegram(issue, sections, lang);
  await sendMessage(chatId, text);
}

// ─── webhook entry ─────────────────────────────────────────────────────

function authorize(req: NextRequest): boolean {
  const expected = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!expected) return true;
  return req.headers.get("x-telegram-bot-api-secret-token") === expected;
}

export async function POST(req: NextRequest) {
  if (!authorize(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let update: TelegramUpdate;
  try {
    update = await req.json();
  } catch {
    return NextResponse.json({ ok: true });
  }

  try {
    // ── Slash commands ─────────────────────────────────────────────
    if (update.message?.text) {
      const chat = update.message.chat;
      // Only DM private chats — silently ignore groups/channels.
      if (chat.type && chat.type !== "private") {
        return NextResponse.json({ ok: true });
      }
      const chatId = chat.id;
      const fromUser = update.message.from;
      const lang = detectLang(fromUser?.language_code);
      const text = update.message.text.trim();

      // Auto-register every interacting user so /track et al. can FK to sl_user.
      if (fromUser) {
        await upsertUser(
          chatId,
          fromUser.username || null,
          fromUser.first_name || null,
          lang,
          null
        ).catch((err) =>
          console.warn("[webhook] upsertUser failed", err)
        );
      }

      const parts = text.split(/\s+/);
      const cmd = (parts[0] || "").toLowerCase().split("@")[0]; // strips bot mention
      const args = parts.slice(1);

      if (cmd === "/start") {
        // /start <token>  — Web Link binding flow.
        if (args[0] && /^[A-Za-z0-9_-]{8,64}$/.test(args[0])) {
          const outcome = await handleStartToken(chatId, args[0], lang);
          if (outcome === "ok") {
            // After successful binding the user has been welcomed; nothing to do.
            return NextResponse.json({ ok: true });
          }
          if (outcome !== "not_found") {
            return NextResponse.json({ ok: true });
          }
          // not_found → fall through to default welcome.
        }
        await showMainMenu(chatId, lang);
      } else if (cmd === "/ainews" || cmd === "/news") {
        await showAiSections(chatId, lang);
      } else if (cmd === "/social" || cmd === "/sociallistening") {
        await cmdFetchSocialSummary(chatId, lang);
      } else if (cmd === "/track") {
        await cmdTrack(chatId, args, lang);
      } else if (cmd === "/list") {
        await cmdList(chatId, lang);
      } else if (cmd === "/pause") {
        await cmdToggle(chatId, false, lang);
      } else if (cmd === "/resume") {
        await cmdToggle(chatId, true, lang);
      } else if (cmd === "/delete") {
        await cmdDelete(chatId, lang);
      } else if (cmd === "/sentiment" || cmd === "/filter") {
        await cmdSentiment(chatId, args, lang);
      } else if (cmd === "/urgency") {
        await cmdUrgency(chatId, args, lang);
      } else if (cmd === "/digest") {
        await cmdDigest(chatId, args, lang);
      } else if (cmd === "/timezone" || cmd === "/tz") {
        await cmdTimezone(chatId, args, lang);
      } else if (cmd === "/run") {
        await cmdRun(chatId, lang);
      } else if (cmd === "/help") {
        await sendMessage(chatId, T.help[lang]);
      } else if (cmd === "/tools") {
        await showMainMenu(chatId, lang);
      }
      // Anything else (plain chat, unknown commands): silent.
    }

    // ── Inline keyboard taps ───────────────────────────────────────
    if (update.callback_query) {
      const cb = update.callback_query;
      const chatId = cb.message?.chat.id;
      const messageId = cb.message?.message_id;
      const lang = detectLang(cb.from.language_code);
      const data = cb.data ?? "";

      // Always dismiss the spinner first; replies happen async.
      await answerCallback(cb.id);

      if (!chatId || !messageId) return NextResponse.json({ ok: true });

      // Auto-register the callback user too (they may have arrived via inline
      // share / forwarded message without ever sending a text).
      if (cb.from) {
        await upsertUser(
          chatId,
          cb.from.username || null,
          cb.from.first_name || null,
          lang,
          null
        ).catch(() => {});
      }

      if (data === "m:root") {
        await editMessageText(
          chatId,
          messageId,
          T.welcome[lang],
          mainMenuMarkup(lang)
        );
      } else if (data === "m:ai") {
        await editMessageText(
          chatId,
          messageId,
          T.aiNewsHeader[lang],
          aiSectionsMarkup(lang)
        );
      } else if (data.startsWith("m:ai:")) {
        const sectionKey = data.slice("m:ai:".length); // b / g / l / c / all
        await sendIssueSection(chatId, lang, sectionKey);
      } else if (data === "m:soc") {
        await cmdFetchSocialSummary(chatId, lang);
      } else if (data === "m:list") {
        await cmdList(chatId, lang);
      }
      // Unknown callback data: silent.
    }
  } catch (err) {
    console.error("[telegram:webhook] handler error", err);
    // Always 200 — Telegram retries 5xx and we don't want double-delivery.
  }

  return NextResponse.json({ ok: true });
}
