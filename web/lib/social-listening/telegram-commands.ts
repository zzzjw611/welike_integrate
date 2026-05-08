/**
 * Telegram bot command handlers — TS port of the _cmd_* functions in
 * backend/telegram_bot.py.
 *
 * Each command is async (because we hit Postgres + Telegram API) and takes
 * (chatId, args, lang) so the webhook route can dispatch by command name.
 *
 * Replies are sent via web/lib/news-telegram.ts sendTelegramMessage. We do
 * NOT swallow errors here — let the webhook's try/catch log them.
 */
import {
  consumeWebLink,
  countUserAlerts,
  createAlert,
  deleteAlert,
  getUser,
  getUserAlerts,
  normalizeMultiFilter,
  setUserTz,
  updateAlert,
  upsertUser,
  MAX_ALERTS_PER_USER,
  SENTIMENT_ORDER,
  URGENCY_ORDER,
  type AlertDict,
} from "@/lib/social-listening/db";
import {
  formatAlertConfirmation,
  filterLabel,
  webHint,
  buildConnectedMsg,
} from "@/lib/social-listening/telegram-formatters";
import { runAlert } from "@/lib/social-listening/scheduler";
import { sendTelegramMessage } from "@/lib/news-telegram";
import type { Lang } from "@/lib/social-listening/types";

function tr(en: string, zh: string, lang: Lang): string {
  return lang === "en" ? en : zh;
}

export function parseTrackArgs(args: string[]): {
  handles: string[];
  keywords: string[];
} {
  const handles: string[] = [];
  const keywords: string[] = [];
  for (const a of args) {
    const v = a.trim();
    if (!v) continue;
    if (v.startsWith("@")) handles.push(v.replace(/^@+/, ""));
    else keywords.push(v);
  }
  return { handles, keywords };
}

// ────────────────────────────────────────────────────────────────────────────
// /start <token>  — bind a web session to this chat
// ────────────────────────────────────────────────────────────────────────────

export async function handleStartToken(
  chatId: number,
  token: string,
  lang: Lang
): Promise<"ok" | "expired" | "already_consumed" | "not_found"> {
  const outcome = await consumeWebLink(token, chatId);
  if (outcome === "ok") {
    await sendTelegramMessage(chatId, buildConnectedMsg(lang));
    return "ok";
  }
  if (outcome === "expired") {
    await sendTelegramMessage(
      chatId,
      tr(
        '⚠️ That connect link has expired. Please go back to the website and click "Connect Telegram" again.',
        "⚠️ 此连接链接已过期。请回到网页端重新点击「连接 Telegram」。",
        lang
      )
    );
    return "expired";
  }
  if (outcome === "already_consumed") {
    await sendTelegramMessage(
      chatId,
      tr(
        "⚠️ That link has already been used. Generate a new one on the website.",
        "⚠️ 此链接已被使用。请在网页端重新生成。",
        lang
      )
    );
    return "already_consumed";
  }
  return "not_found";
}

// ────────────────────────────────────────────────────────────────────────────
// /track @handle  /track keyword  — create an alert
// ────────────────────────────────────────────────────────────────────────────

export async function cmdTrack(
  chatId: number,
  args: string[],
  lang: Lang
): Promise<void> {
  if (args.length === 0) {
    await sendTelegramMessage(
      chatId,
      tr(
        "Usage: /track @handle [more handles or keywords]\nExample: /track @StableStock tesla",
        "用法：/track @handle [更多 handle 或关键词]\n例：/track @StableStock tesla",
        lang
      )
    );
    return;
  }
  const existing = await countUserAlerts(chatId);
  if (existing >= MAX_ALERTS_PER_USER) {
    await sendTelegramMessage(
      chatId,
      tr(
        `❌ You're at the limit (${MAX_ALERTS_PER_USER} alert per user). /delete the old one first.`,
        `❌ 已达上限（每人 ${MAX_ALERTS_PER_USER} 个 alert）。请先 /delete 旧的。`,
        lang
      )
    );
    return;
  }
  const { handles, keywords } = parseTrackArgs(args);
  if (handles.length === 0 && keywords.length === 0) {
    await sendTelegramMessage(
      chatId,
      tr(
        "Please provide at least one handle or keyword. Example: /track @StableStock",
        "请至少提供一个 handle 或关键词。例：/track @StableStock",
        lang
      )
    );
    return;
  }
  const alert = await createAlert(chatId, handles, keywords);
  await sendTelegramMessage(
    chatId,
    formatAlertConfirmation(alert, lang, "telegram")
  );
}

// ────────────────────────────────────────────────────────────────────────────
// /list — show the user's alerts
// ────────────────────────────────────────────────────────────────────────────

export async function cmdList(chatId: number, lang: Lang): Promise<void> {
  const alerts = await getUserAlerts(chatId);
  if (alerts.length === 0) {
    await sendTelegramMessage(
      chatId,
      tr(
        "You don't have an alert yet.\nRun /track @handle to create one.",
        "你还没有 alert。\n发送 /track @handle 创建一个。",
        lang
      )
    );
    return;
  }
  const user = await getUser(chatId);
  const tzStr =
    user?.tz ||
    tr("Asia/Shanghai (default)", "Asia/Shanghai（默认）", lang);
  const lines: string[] = [tr("📋 Your alert:", "📋 你的 alert：", lang)];
  for (const d of alerts) {
    const label = [
      ...d.handles.map((h) => `@${h}`),
      ...d.keywords,
    ].join(" ");
    const status = d.active
      ? tr("🟢 active", "🟢 已启用", lang)
      : tr("⏸ paused", "⏸ 已暂停", lang);
    const last = d.last_run_at
      ? d.last_run_at.slice(0, 19)
      : tr("not yet", "尚未运行", lang);
    const digest = d.digest_mode
      ? tr("on", "开", lang)
      : tr("off", "关", lang);
    lines.push(
      `\n#${d.id}  ${status}\n` +
        `  📡 ${label}\n` +
        `  🎯 ${tr("Sentiment", "情感", lang)}: ${filterLabel(
          d.sentiment_filter,
          "sentiment",
          lang
        )}\n` +
        `  🚨 ${tr("Urgency", "紧急度", lang)}: ${filterLabel(
          d.urgency_filter,
          "urgency",
          lang
        )}\n` +
        `  📚 ${tr("Digest", "摘要", lang)}: ${digest}\n` +
        `  ⏱ ${tr("Last run", "上次运行", lang)}: ${last}`
    );
  }
  lines.push(`\n🌐 ${tr("Timezone", "时区", lang)}: ${tzStr}`);
  lines.push(webHint(lang));
  await sendTelegramMessage(chatId, lines.join("\n"));
}

// ────────────────────────────────────────────────────────────────────────────
// /pause /resume — toggle .active
// ────────────────────────────────────────────────────────────────────────────

export async function cmdToggle(
  chatId: number,
  active: boolean,
  lang: Lang
): Promise<void> {
  const alerts = await getUserAlerts(chatId);
  if (alerts.length === 0) {
    await sendTelegramMessage(
      chatId,
      tr(
        "No alert to update. Run /track to create one first.",
        "没有可更新的 alert。请先发送 /track 创建一个。",
        lang
      )
    );
    return;
  }
  await updateAlert(alerts[0].id, { active });
  await sendTelegramMessage(
    chatId,
    active
      ? tr("▶️ Pushes resumed.", "▶️ 推送已恢复。", lang)
      : tr("⏸ Pushes paused.", "⏸ 推送已暂停。", lang)
  );
}

// ────────────────────────────────────────────────────────────────────────────
// /delete — wipe the alert
// ────────────────────────────────────────────────────────────────────────────

export async function cmdDelete(
  chatId: number,
  lang: Lang
): Promise<void> {
  const alerts = await getUserAlerts(chatId);
  if (alerts.length === 0) {
    await sendTelegramMessage(
      chatId,
      tr("Nothing to delete.", "没有可删除的 alert。", lang)
    );
    return;
  }
  const aid = alerts[0].id;
  await deleteAlert(aid);
  await sendTelegramMessage(
    chatId,
    tr(
      `🗑 Deleted alert #${aid}. You can /track again to create a new one.`,
      `🗑 已删除 alert #${aid}。可发送 /track 创建新的。`,
      lang
    )
  );
}

// ────────────────────────────────────────────────────────────────────────────
// /sentiment <all|csv>
// ────────────────────────────────────────────────────────────────────────────

export async function cmdSentiment(
  chatId: number,
  args: string[],
  lang: Lang
): Promise<void> {
  if (args.length === 0) {
    await sendTelegramMessage(
      chatId,
      tr(
        "Usage: /sentiment <all|positive|negative|neutral>\nMulti-select with commas (no spaces): /sentiment positive,neutral",
        "用法：/sentiment <all|positive|negative|neutral>\n多选用逗号（不要空格）：/sentiment positive,neutral",
        lang
      )
    );
    return;
  }
  const raw = args[0];
  const canonical = normalizeMultiFilter(raw, SENTIMENT_ORDER);
  if (!canonical) {
    await sendTelegramMessage(
      chatId,
      tr(
        `⚠️ Invalid value: ${raw}\nUse 'all' or a comma-separated subset of positive,negative,neutral.\nExample: /sentiment negative,neutral`,
        `⚠️ 无效值：${raw}\n请用 'all' 或 positive,negative,neutral 的逗号子集。\n例：/sentiment negative,neutral`,
        lang
      )
    );
    return;
  }
  const alerts = await getUserAlerts(chatId);
  if (alerts.length === 0) {
    await sendTelegramMessage(
      chatId,
      tr(
        "No alert to update. Run /track to create one first.",
        "没有可更新的 alert。请先发送 /track 创建一个。",
        lang
      )
    );
    return;
  }
  await updateAlert(alerts[0].id, { sentiment_filter: canonical });
  await sendTelegramMessage(
    chatId,
    tr(
      `✅ Sentiment filter set to: ${filterLabel(canonical, "sentiment", lang)}`,
      `✅ 情感过滤已设为：${filterLabel(canonical, "sentiment", lang)}`,
      lang
    )
  );
}

// ────────────────────────────────────────────────────────────────────────────
// /urgency <all|csv>
// ────────────────────────────────────────────────────────────────────────────

export async function cmdUrgency(
  chatId: number,
  args: string[],
  lang: Lang
): Promise<void> {
  if (args.length === 0) {
    await sendTelegramMessage(
      chatId,
      tr(
        "Usage: /urgency <all|high|medium|low>\nMulti-select with commas (no spaces): /urgency high,medium",
        "用法：/urgency <all|high|medium|low>\n多选用逗号（不要空格）：/urgency high,medium",
        lang
      )
    );
    return;
  }
  const raw = args[0];
  const canonical = normalizeMultiFilter(raw, URGENCY_ORDER);
  if (!canonical) {
    await sendTelegramMessage(
      chatId,
      tr(
        `⚠️ Invalid value: ${raw}\nUse 'all' or a comma-separated subset of high,medium,low.\nExample: /urgency high,medium`,
        `⚠️ 无效值：${raw}\n请用 'all' 或 high,medium,low 的逗号子集。\n例：/urgency high,medium`,
        lang
      )
    );
    return;
  }
  const alerts = await getUserAlerts(chatId);
  if (alerts.length === 0) {
    await sendTelegramMessage(
      chatId,
      tr(
        "No alert to update. Run /track to create one first.",
        "没有可更新的 alert。请先发送 /track 创建一个。",
        lang
      )
    );
    return;
  }
  await updateAlert(alerts[0].id, { urgency_filter: canonical });
  await sendTelegramMessage(
    chatId,
    tr(
      `✅ Urgency filter set to: ${filterLabel(canonical, "urgency", lang)}`,
      `✅ 紧急度过滤已设为：${filterLabel(canonical, "urgency", lang)}`,
      lang
    )
  );
}

// ────────────────────────────────────────────────────────────────────────────
// /digest <on|off>
// ────────────────────────────────────────────────────────────────────────────

export async function cmdDigest(
  chatId: number,
  args: string[],
  lang: Lang
): Promise<void> {
  const raw = (args[0] || "").toLowerCase();
  if (!["on", "off"].includes(raw)) {
    await sendTelegramMessage(
      chatId,
      tr(
        "Usage: /digest <on|off>\nWhen on, ≥5 hits in a single poll get batched into one summary.",
        "用法：/digest <on|off>\n开启后，单次轮询命中 ≥5 条时会合并为一条摘要。",
        lang
      )
    );
    return;
  }
  const alerts = await getUserAlerts(chatId);
  if (alerts.length === 0) {
    await sendTelegramMessage(
      chatId,
      tr(
        "No alert to update. Run /track to create one first.",
        "没有可更新的 alert。请先发送 /track 创建一个。",
        lang
      )
    );
    return;
  }
  const on = raw === "on";
  await updateAlert(alerts[0].id, { digest_mode: on });
  await sendTelegramMessage(
    chatId,
    tr(
      `✅ Digest mode is now ${on ? "on" : "off"}.`,
      `✅ 摘要模式已${on ? "开启" : "关闭"}。`,
      lang
    )
  );
}

// ────────────────────────────────────────────────────────────────────────────
// /timezone <IANA>
// ────────────────────────────────────────────────────────────────────────────

function isValidTimezone(tz: string): boolean {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

export async function cmdTimezone(
  chatId: number,
  args: string[],
  lang: Lang
): Promise<void> {
  if (args.length === 0) {
    const user = await getUser(chatId);
    const cur =
      user?.tz ||
      tr("Asia/Shanghai (default)", "Asia/Shanghai（默认）", lang);
    await sendTelegramMessage(
      chatId,
      tr(
        `Current timezone: ${cur}\n\nUsage: /timezone <IANA name>\nCommon values:\n  Asia/Shanghai\n  Asia/Tokyo\n  America/New_York\n  America/Los_Angeles\n  Europe/London`,
        `当前时区：${cur}\n\n用法：/timezone <IANA 名称>\n常用值：\n  Asia/Shanghai\n  Asia/Tokyo\n  America/New_York\n  America/Los_Angeles\n  Europe/London`,
        lang
      )
    );
    return;
  }
  const tz = args[0].trim();
  if (!isValidTimezone(tz)) {
    await sendTelegramMessage(
      chatId,
      tr(
        `⚠️ Not a valid timezone: ${tz}\nUse an IANA name like Asia/Shanghai.`,
        `⚠️ 无效时区：${tz}\n请使用 IANA 命名，如 Asia/Shanghai。`,
        lang
      )
    );
    return;
  }
  const ok = await setUserTz(chatId, tz);
  if (!ok) {
    // User row missing — re-upsert and retry.
    await upsertUser(chatId, null, null, lang, tz);
  }
  await sendTelegramMessage(
    chatId,
    tr(
      `✅ Timezone set to: ${tz}\nFuture pushes will use this timezone.`,
      `✅ 时区已设为：${tz}\n之后推送将使用此时区。`,
      lang
    )
  );
}

// ────────────────────────────────────────────────────────────────────────────
// /run — manual immediate poll for the user's first alert
// ────────────────────────────────────────────────────────────────────────────

export async function cmdRun(chatId: number, lang: Lang): Promise<void> {
  const alerts = await getUserAlerts(chatId);
  if (alerts.length === 0) {
    await sendTelegramMessage(
      chatId,
      tr(
        "Nothing to run — create an alert first with /track @handle.",
        "没有可运行的 alert，请先发送 /track @handle 创建。",
        lang
      )
    );
    return;
  }
  await sendTelegramMessage(
    chatId,
    tr("⏳ Running your alert now...", "⏳ 正在立即运行你的 alert…", lang)
  );
  await runAlert(alerts[0]);
}

// ────────────────────────────────────────────────────────────────────────────
// /social — quick summary of recent mentions for the user's alerts
//
// Server-side helper that runs an analyze-style fetch + classify against the
// user's alert handles/keywords and sends a compact digest. Powers both the
// /social slash command and the "Social Listening" callback button.
// ────────────────────────────────────────────────────────────────────────────

import { collectTweets } from "@/lib/social-listening/collectors/twitter";
import { classifyTweets } from "@/lib/social-listening/analyzers/classify";

const SOCIAL_HEADER_EN = "📡 <b>Social Listening · Recent Mentions</b>\n";
const SOCIAL_HEADER_ZH = "📡 <b>社交聆听 · 最近提及</b>\n";

export async function cmdFetchSocialSummary(
  chatId: number,
  lang: Lang
): Promise<void> {
  await sendTelegramMessage(
    chatId,
    tr(
      "📡 Fetching latest Social Listening data...",
      "📡 正在获取最新的社交聆听数据…",
      lang
    )
  );
  const alerts = await getUserAlerts(chatId);
  if (alerts.length === 0) {
    await sendTelegramMessage(
      chatId,
      tr(
        "📡 You don't have any alerts yet. Use /track to create one first.",
        "📡 你还没有 alert。请先发送 /track 创建一个。",
        lang
      )
    );
    return;
  }

  const lines: string[] = [lang === "en" ? SOCIAL_HEADER_EN : SOCIAL_HEADER_ZH];
  for (const alert of alerts.slice(0, 3)) {
    const handles = alert.handles || [];
    const keywords = alert.keywords || [];
    const queryParts = [
      ...handles.map((h) => `@${h.replace(/^@/, "")}`),
      ...keywords,
    ];
    if (queryParts.length === 0) continue;
    const query =
      queryParts.length === 1
        ? queryParts[0]
        : `(${queryParts.join(" OR ")})`;

    let tweets;
    try {
      tweets = await collectTweets(query, 5, "24h");
      if (tweets.length > 0) {
        await classifyTweets(tweets);
      }
    } catch {
      continue;
    }
    if (!tweets || tweets.length === 0) continue;

    const label = queryParts.join(" ");
    lines.push(`🔍 <b>${escapeHtml(label)}</b>\n`);
    for (const tw of tweets.slice(0, 3)) {
      const author = tw.author_username || "unknown";
      const text = (tw.text || "").slice(0, 150);
      const url = tw.url || "";
      const sent = tw.sentiment || "";
      const emoji =
        sent === "positive"
          ? "🟢"
          : sent === "negative"
          ? "🔴"
          : sent === "neutral"
          ? "⚪"
          : "";
      lines.push(
        url
          ? `${emoji} @${escapeHtml(author)}\n${escapeHtml(text)}\n🔗 ${url}\n`
          : `${emoji} @${escapeHtml(author)}\n${escapeHtml(text)}\n`
      );
    }
  }

  if (lines.length === 1) {
    await sendTelegramMessage(
      chatId,
      tr(
        "📡 No recent mentions found for your alerts.",
        "📡 当前 alert 暂无最新提及。",
        lang
      )
    );
    return;
  }
  await sendTelegramMessage(chatId, lines.join("\n"));
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Re-exports for callers that need raw types.
export type { AlertDict };
