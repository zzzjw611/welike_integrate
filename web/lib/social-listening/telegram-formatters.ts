/**
 * Telegram message formatters — TS port of the format_* helpers in
 * backend/telegram_bot.py.
 *
 * Every formatter accepts a `lang` parameter and renders strings in either
 * 'zh' or 'en'. Defaults to 'zh' (matching the WeLike default UI). Emojis,
 * tweet URLs and proper nouns (X, Telegram, etc) are language-neutral.
 */
import type { AlertDict } from "@/lib/social-listening/db";
import type { Lang, Tweet } from "@/lib/social-listening/types";

const WEB_URL_DEFAULT = "https://welike-integrate.vercel.app";

export function webUrl(): string {
  return (process.env.WEB_URL || WEB_URL_DEFAULT).replace(/\/+$/, "");
}

// ────────────────────────────────────────────────────────────────────────────
// Tag dictionaries — bilingual labels keyed by canonical value
// ────────────────────────────────────────────────────────────────────────────

const SENTIMENT_TAGS: Record<string, { emoji: string; en: string; zh: string }> = {
  positive: { emoji: "🟢", en: "Positive", zh: "正面" },
  negative: { emoji: "🔴", en: "Negative", zh: "负面" },
  neutral: { emoji: "⚪", en: "Neutral", zh: "中性" },
};

const URGENCY_TAGS: Record<string, { emoji: string; en: string; zh: string }> = {
  high: { emoji: "🚨", en: "High urgency", zh: "高紧急" },
  medium: { emoji: "⚠️", en: "Medium urgency", zh: "中等紧急" },
  low: { emoji: "🔵", en: "Low urgency", zh: "低紧急" },
};

const ACTION_TAGS: Record<string, { emoji: string; en: string; zh: string }> = {
  reply_now: { emoji: "💬", en: "Reply now", zh: "立即回复" },
  log_product: { emoji: "📋", en: "Log to product", zh: "记入产品后台" },
  monitor: { emoji: "👀", en: "Monitor", zh: "持续监控" },
  share_amplify: { emoji: "📢", en: "Amplify", zh: "扩散转发" },
  ignore: { emoji: "🔕", en: "Ignore", zh: "忽略" },
};

const CATEGORY_TAGS: Record<string, { emoji: string; en: string; zh: string }> = {
  key_voice: { emoji: "🎙", en: "Key voice", zh: "重要声音" },
  feature_request: { emoji: "💡", en: "Feature request", zh: "功能建议" },
  bug_issue: { emoji: "🐛", en: "Bug / complaint", zh: "Bug / 投诉" },
  competitor: { emoji: "🥊", en: "Competitor mention", zh: "竞品提及" },
  general: { emoji: "", en: "", zh: "" }, // catch-all — render no tag
};

function pick(label: { en: string; zh: string }, lang: Lang): string {
  return lang === "en" ? label.en : label.zh;
}

// ────────────────────────────────────────────────────────────────────────────
// Filter labels (canonical "all" / CSV → friendly emoji-prefixed string)
// ────────────────────────────────────────────────────────────────────────────

export function filterLabel(
  canonical: string,
  kind: "sentiment" | "urgency",
  lang: Lang = "zh"
): string {
  if (canonical === "all") return lang === "en" ? "All" : "全部";
  const tags = kind === "sentiment" ? SENTIMENT_TAGS : URGENCY_TAGS;
  return canonical
    .split(",")
    .map((p) => {
      const t = tags[p];
      return t ? `${t.emoji} ${pick(t, lang)}` : p;
    })
    .join(" + ");
}

// ────────────────────────────────────────────────────────────────────────────
// Web CTA / hint / connected / welcome / help — bilingual
// ────────────────────────────────────────────────────────────────────────────

export function webCta(lang: Lang = "zh"): string {
  if (lang === "en") {
    return [
      "━━━━━━━━━━━━━━━━━━━━",
      "🌐 Manage from the web — easiest way",
      `👉 ${webUrl()}/tools/social-listening  ·  Create Alerts`,
      "━━━━━━━━━━━━━━━━━━━━",
    ].join("\n");
  }
  return [
    "━━━━━━━━━━━━━━━━━━━━",
    "🌐 在网页端管理 — 最简单",
    `👉 ${webUrl()}/tools/social-listening  ·  创建提醒`,
    "━━━━━━━━━━━━━━━━━━━━",
  ].join("\n");
}

export function webHint(lang: Lang = "zh"): string {
  if (lang === "en") {
    return `🌐 Manage from the web: ${webUrl()}/tools/social-listening  → Create Alerts`;
  }
  return `🌐 在网页端管理: ${webUrl()}/tools/social-listening  → 创建提醒`;
}

export function buildConnectedMsg(lang: Lang = "zh"): string {
  if (lang === "en") {
    return [
      "✅ Connected to the WeLike website!",
      "Your Telegram is now linked. Pushes will land here automatically.",
      "",
      webCta(lang),
      "",
      "Commands:",
      "  /ainews  → today's top AI news",
      "  /social  → your Social Listening mentions",
      "  /list  → see your alert",
      "  /pause  /resume  /delete",
      "  /help  → all commands",
    ].join("\n");
  }
  return [
    "✅ 已连接到 WeLike 网页端！",
    "你的 Telegram 已绑定，推送会自动发到这里。",
    "",
    webCta(lang),
    "",
    "命令：",
    "  /ainews  → 今日 AI 要闻",
    "  /social  → 你的社交聆听提醒",
    "  /list  → 查看你的 alert",
    "  /pause  /resume  /delete",
    "  /help  → 全部命令",
  ].join("\n");
}

// ────────────────────────────────────────────────────────────────────────────
// Alert confirmation
// ────────────────────────────────────────────────────────────────────────────

export function formatAlertConfirmation(
  alert: AlertDict,
  lang: Lang = "zh",
  source: "telegram" | "web" = "telegram"
): string {
  const handles = alert.handles || [];
  const keywords = alert.keywords || [];
  const watchingParts = [
    ...handles.map((h) => `@${h}`),
    ...keywords,
  ];
  const sentLabel = filterLabel(
    alert.sentiment_filter || "all",
    "sentiment",
    lang
  );
  const urgLabel = filterLabel(
    alert.urgency_filter || "all",
    "urgency",
    lang
  );
  const aid = alert.id;
  if (lang === "en") {
    const watching = watchingParts.join(" ") || "(empty)";
    const digest = alert.digest_mode ? "on" : "off";
    const via = source === "web" ? " via the website" : "";
    return [
      `✅ Alert created${via} (ID #${aid})`,
      "",
      webCta(lang),
      "",
      `📡 Watching: ${watching}`,
      `⏱ Interval: 10 minutes`,
      `🎯 Sentiment filter: ${sentLabel}`,
      `🚨 Urgency filter: ${urgLabel}`,
      `📚 Digest mode: ${digest}`,
      "",
      "Pushes start automatically. Use /list, /sentiment, /urgency, /digest to tweak.",
    ].join("\n");
  }
  const watching = watchingParts.join(" ") || "（空）";
  const digest = alert.digest_mode ? "开" : "关";
  const via = source === "web" ? "（来自网页端）" : "";
  return [
    `✅ Alert 已创建${via} (ID #${aid})`,
    "",
    webCta(lang),
    "",
    `📡 监测对象：${watching}`,
    `⏱ 轮询间隔：10 分钟`,
    `🎯 情感过滤：${sentLabel}`,
    `🚨 紧急度过滤：${urgLabel}`,
    `📚 摘要模式：${digest}`,
    "",
    "推送已自动开启。可用 /list、/sentiment、/urgency、/digest 调整。",
  ].join("\n");
}

// ────────────────────────────────────────────────────────────────────────────
// Time formatting
// ────────────────────────────────────────────────────────────────────────────

/**
 * Render an ISO 8601 (or X-style "Mon Apr 27 09:53:37 +0000 2026") timestamp
 * in the user's IANA timezone. Output: "2026-04-27 09:53:37 (UTC+08:00)".
 *
 * Falls back to Asia/Shanghai when no tz supplied or the supplied one is
 * invalid (matches Python behaviour).
 */
export function formatTimeInTz(
  isoStr: string,
  tzName: string | null = null
): string {
  if (!isoStr) return "";
  let dt = new Date(isoStr);
  if (Number.isNaN(dt.getTime())) {
    // Try X-style "Sat Apr 27 09:53:37 +0000 2026"
    const m = isoStr.match(
      /^[A-Za-z]+ ([A-Za-z]+) (\d+) (\d{2}):(\d{2}):(\d{2}) ([+\-]\d{4}) (\d{4})$/
    );
    if (m) {
      const months: Record<string, number> = {
        Jan: 0,
        Feb: 1,
        Mar: 2,
        Apr: 3,
        May: 4,
        Jun: 5,
        Jul: 6,
        Aug: 7,
        Sep: 8,
        Oct: 9,
        Nov: 10,
        Dec: 11,
      };
      const month = months[m[1]] ?? 0;
      const day = Number(m[2]);
      const h = Number(m[3]);
      const mi = Number(m[4]);
      const s = Number(m[5]);
      const off = m[6];
      const year = Number(m[7]);
      const offMinutes =
        (off[0] === "-" ? -1 : 1) *
        (Number(off.slice(1, 3)) * 60 + Number(off.slice(3, 5)));
      dt = new Date(
        Date.UTC(year, month, day, h, mi, s) - offMinutes * 60 * 1000
      );
    } else {
      return isoStr;
    }
  }

  const tz = tzName || "Asia/Shanghai";
  let formatted: string;
  let offsetStr = "UTC";
  try {
    const dtf = new Intl.DateTimeFormat("en-CA", {
      timeZone: tz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      timeZoneName: "longOffset",
    });
    const parts = dtf.formatToParts(dt);
    const get = (name: string) =>
      parts.find((p) => p.type === name)?.value || "";
    formatted = `${get("year")}-${get("month")}-${get("day")} ${get("hour")}:${get("minute")}:${get("second")}`;
    const offsetPart = get("timeZoneName"); // e.g. "GMT+08:00"
    if (offsetPart) {
      offsetStr = offsetPart.replace("GMT", "UTC");
    }
  } catch {
    // Fallback to Shanghai +08:00 manual.
    const local = new Date(dt.getTime() + 8 * 3600 * 1000);
    formatted = local.toISOString().slice(0, 19).replace("T", " ");
    offsetStr = "UTC+08:00";
  }
  return `${formatted} (${offsetStr})`;
}

export function fmtCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

// ────────────────────────────────────────────────────────────────────────────
// Per-tweet alert message
// ────────────────────────────────────────────────────────────────────────────

export function formatAlertMessage(
  handles: string[],
  keywords: string[],
  tweet: Tweet,
  tz: string | null = null,
  lang: Lang = "zh"
): string {
  const projectLabel = [
    ...handles.map((h) => `@${h.replace(/^@/, "")}`),
    ...keywords,
  ].join(" ");

  const sent = SENTIMENT_TAGS[tweet.sentiment ?? "neutral"];
  const urg = URGENCY_TAGS[tweet.urgency ?? "low"];
  const act = ACTION_TAGS[tweet.action ?? "monitor"];
  const cat = CATEGORY_TAGS[tweet.category ?? "general"];

  const trio: string[] = [];
  if (sent && pick(sent, lang)) trio.push(`${sent.emoji} ${pick(sent, lang)}`);
  if (urg && pick(urg, lang)) trio.push(`${urg.emoji} ${pick(urg, lang)}`);
  if (act && pick(act, lang)) trio.push(`${act.emoji} ${pick(act, lang)}`);
  const trioLine = trio.join("  ");

  const authorName = (tweet.author_name || "").trim();
  const authorUsername = tweet.author_username || "";
  const followers = Number(tweet.author_followers || 0);
  let authorLine = `👤 ${authorName} (@${authorUsername})`;
  if (followers > 0)
    authorLine += ` · ${fmtCount(followers)} ${lang === "en" ? "followers" : "粉丝"}`;

  let text = (tweet.text || "").trim();
  if (text.length > 280) text = text.slice(0, 277) + "...";
  const created = formatTimeInTz(tweet.created_at || "", tz);
  const summary = (tweet.summary || "").trim();

  const headline =
    lang === "en" ? `🔔 ${projectLabel} · New mention` : `🔔 ${projectLabel} · 新提及`;
  const lines: string[] = [headline, ""];
  if (trioLine) lines.push(trioLine);
  if (cat && pick(cat, lang)) lines.push(`${cat.emoji} ${pick(cat, lang)}`);
  lines.push("", `🕐 ${created}`, authorLine);
  if (text) lines.push("", text);
  if (summary) lines.push("", `📌 ${summary}`);
  if (tweet.url) lines.push("", tweet.url);
  return lines.join("\n");
}

// ────────────────────────────────────────────────────────────────────────────
// Digest message (≥5 hits in one poll, batched)
// ────────────────────────────────────────────────────────────────────────────

export function formatDigestMessage(
  handles: string[],
  keywords: string[],
  tweets: Tweet[],
  _tz: string | null = null,
  lang: Lang = "zh"
): string {
  const projectLabel = [
    ...handles.map((h) => `@${h.replace(/^@/, "")}`),
    ...keywords,
  ].join(" ");
  const n = tweets.length;
  const sentCount: Record<string, number> = {
    positive: 0,
    negative: 0,
    neutral: 0,
  };
  const urgCount: Record<string, number> = {
    high: 0,
    medium: 0,
    low: 0,
  };
  for (const t of tweets) {
    sentCount[t.sentiment || "neutral"] =
      (sentCount[t.sentiment || "neutral"] || 0) + 1;
    urgCount[t.urgency || "low"] = (urgCount[t.urgency || "low"] || 0) + 1;
  }
  function fmtDist(
    d: Record<string, number>,
    tags: typeof SENTIMENT_TAGS
  ): string {
    const parts: string[] = [];
    for (const [k, v] of Object.entries(d)) {
      if (v === 0) continue;
      const t = tags[k];
      parts.push(`${t?.emoji || ""} ${pick(t || { en: k, zh: k }, lang)} ${v}`);
    }
    return parts.join("  ") || "—";
  }
  const sentLine = fmtDist(sentCount, SENTIMENT_TAGS);
  const urgLine = fmtDist(urgCount, URGENCY_TAGS);

  const URG_PRIORITY: Record<string, number> = { high: 3, medium: 2, low: 1 };
  const ranked = [...tweets].sort((a, b) => {
    const ua = URG_PRIORITY[a.urgency || "low"] ?? 0;
    const ub = URG_PRIORITY[b.urgency || "low"] ?? 0;
    if (ua !== ub) return ub - ua;
    return Number(b.engagement || 0) - Number(a.engagement || 0);
  });
  const top = ranked.slice(0, 3);

  const isEn = lang === "en";
  const lines: string[] = [
    isEn
      ? `🔔 ${projectLabel} · ${n} new mentions`
      : `🔔 ${projectLabel} · 新增 ${n} 条提及`,
    "",
  ];
  lines.push(isEn ? `📊 Sentiment: ${sentLine}` : `📊 情感分布：${sentLine}`);
  lines.push(isEn ? `⏱ Urgency:  ${urgLine}` : `⏱ 紧急度：${urgLine}`);
  lines.push("", isEn ? "🎯 Top 3 to look at:" : "🎯 重点关注 Top 3：");
  for (const t of top) {
    const sEmoji = SENTIMENT_TAGS[t.sentiment || "neutral"]?.emoji ?? "";
    const uEmoji = URGENCY_TAGS[t.urgency || "low"]?.emoji ?? "";
    const aEmoji = ACTION_TAGS[t.action || "monitor"]?.emoji ?? "";
    const author = t.author_username || "";
    const followers = Number(t.author_followers || 0);
    const followersStr = followers ? ` · ${fmtCount(followers)}` : "";
    let snippet = (t.text || "").trim().replace(/\n/g, " ");
    if (snippet.length > 100) snippet = snippet.slice(0, 97) + "...";
    lines.push("");
    lines.push(`${sEmoji}${uEmoji}${aEmoji} @${author}${followersStr}`);
    lines.push(snippet);
    if (t.url) lines.push(t.url);
  }
  lines.push(
    "",
    isEn
      ? "Reply /digest off to switch back to per-tweet pushes."
      : "发送 /digest off 可关闭摘要模式，恢复逐条推送。"
  );
  return lines.join("\n");
}

// ────────────────────────────────────────────────────────────────────────────
// Bot username (cached)
// ────────────────────────────────────────────────────────────────────────────

let _botUsername: string | null = null;

/**
 * Return the bot's @username (without the @). Cached in-process. First
 * resolution path: TELEGRAM_BOT_USERNAME env. Second: getMe API call.
 */
export async function getBotUsername(): Promise<string | null> {
  if (_botUsername) return _botUsername;
  const fromEnv = process.env.TELEGRAM_BOT_USERNAME;
  if (fromEnv) {
    _botUsername = fromEnv.replace(/^@/, "");
    return _botUsername;
  }
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return null;
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/getMe`, {
      method: "POST",
    });
    const data = (await res.json()) as { ok?: boolean; result?: { username?: string } };
    if (data.ok && data.result?.username) {
      _botUsername = data.result.username;
      return _botUsername;
    }
  } catch {
    // ignore — caller can fall back to no deep_link
  }
  return null;
}
