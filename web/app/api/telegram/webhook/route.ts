import { NextRequest, NextResponse } from "next/server";
import { getLatestIssue } from "@/lib/ai-marketer-news";
import {
  formatIssueForTelegram,
  type AlertSections,
} from "@/lib/news-telegram";

// Stateless interactive menu bot for @WeLike_Alerts_bot.
//
// Design:
//   /start  → main menu: [AI News] [Social Listening]
//   tap "AI News"  → sections menu: [Daily Brief] [Growth Insight]
//                                   [Launch Radar] [Daily Case] [All]
//   tap a section  → bot sends that part of the latest issue inline
//   tap "Social Listening" → placeholder (deep-links to web)
//
// No persistence. Every interaction is "pull": the user taps a button and
// gets content right then. No subscription, no DB, no cron.
//
// Webhook bootstrap (one-time): scripts/setup-telegram-webhook.sh
// Telegram echoes our TELEGRAM_WEBHOOK_SECRET in the
// X-Telegram-Bot-Api-Secret-Token header so we can reject forgeries.

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const BASE_URL = process.env.WEB_BASE_URL || "https://welike-integrate.vercel.app";
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
  from?: { id: number; language_code?: string };
  chat: { id: number };
  text?: string;
}
interface TelegramCallbackQuery {
  id: string;
  from: { id: number; language_code?: string };
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
    en: `👋 <b>Welcome!</b>

What would you like to receive?`,
    zh: `👋 <b>欢迎！</b>

你想接收哪类信息？`,
  },
  aiNewsHeader: {
    en: `📰 <b>AI Marketer News</b>

Pick a section:`,
    zh: `📰 <b>AI Marketer News</b>

选择一个板块：`,
  },
  socialPlaceholder: {
    en: `📡 <b>Social Listening</b>

Real-time mentions for your product and competitors.

🛠 Telegram delivery for Social Listening is coming soon.
For now, view your dashboard:
👉 ${BASE_URL}/tools/social-listening`,
    zh: `📡 <b>Social Listening</b>

实时跟踪你的产品和竞品被讨论的情况。

🛠 Telegram 推送即将上线。
现在请前往网页：
👉 ${BASE_URL}/tools/social-listening`,
  },
  noIssue: {
    en: `📭 No issue published yet. Check back tomorrow morning.`,
    zh: `📭 今天还没发布日报，明早再来看吧。`,
  },
  help: {
    en: `📚 <b>Commands</b>

/start — Open the main menu
/ainews — AI News section picker
/help — Show this menu

🌐 ${BASE_URL}/tools/news`,
    zh: `📚 <b>命令</b>

/start — 打开主菜单
/ainews — 选择 AI News 板块
/help — 显示此菜单

🌐 ${BASE_URL}/tools/news`,
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
          text: lang === "zh" ? "📰 AI News" : "📰 AI News",
          callback_data: "m:ai",
        },
      ],
      [
        {
          text: lang === "zh" ? "📡 Social Listening" : "📡 Social Listening",
          callback_data: "m:soc",
        },
      ],
    ],
  };
}

function aiSectionsMarkup(lang: Lang): InlineKeyboardMarkup {
  return {
    inline_keyboard: [
      [
        {
          text: lang === "zh" ? "📋 Daily Brief" : "📋 Daily Brief",
          callback_data: "m:ai:b",
        },
      ],
      [
        {
          text: lang === "zh" ? "💡 Growth Insight" : "💡 Growth Insight",
          callback_data: "m:ai:g",
        },
      ],
      [
        {
          text: lang === "zh" ? "🚀 Launch Radar" : "🚀 Launch Radar",
          callback_data: "m:ai:l",
        },
      ],
      [
        {
          text: lang === "zh" ? "📊 Daily Case" : "📊 Daily Case",
          callback_data: "m:ai:c",
        },
      ],
      [
        {
          text: lang === "zh" ? "✨ All" : "✨ All",
          callback_data: "m:ai:all",
        },
      ],
      [
        {
          text: lang === "zh" ? "← 返回" : "← Back",
          callback_data: "m:root",
        },
      ],
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
  const text = formatIssueForTelegram(issue, sections);
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
      const chatId = update.message.chat.id;
      const lang = detectLang(update.message.from?.language_code);
      const text = update.message.text.trim();

      if (text.startsWith("/start")) {
        await showMainMenu(chatId, lang);
      } else if (text === "/ainews") {
        await showAiSections(chatId, lang);
      } else if (text === "/help") {
        await sendMessage(chatId, T.help[lang]);
      }
      // Anything else: silent, default Telegram bot behaviour.
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

      if (data === "m:root") {
        await editMessageText(chatId, messageId, T.welcome[lang], mainMenuMarkup(lang));
      } else if (data === "m:ai") {
        await editMessageText(chatId, messageId, T.aiNewsHeader[lang], aiSectionsMarkup(lang));
      } else if (data.startsWith("m:ai:")) {
        const sectionKey = data.slice("m:ai:".length); // b / g / l / c / all
        await sendIssueSection(chatId, lang, sectionKey);
      } else if (data === "m:soc") {
        await sendMessage(chatId, T.socialPlaceholder[lang]);
      }
    }
  } catch (err) {
    console.error("[telegram:webhook] handler error", err);
    // Always 200 — Telegram retries 5xx and we don't want double-delivery.
  }

  return NextResponse.json({ ok: true });
}
