/**
 * Smart Alerts scheduler — TS port of backend/scheduler.py.
 *
 * On Vercel there is no long-running process; instead, /api/social-listening/
 * cron/poll-alerts hits pollAllAlerts on an every-10-minute Vercel Cron. Each
 * invocation has a hard wall clock budget (configurable via budgetMs) so we
 * stop processing alerts before maxDuration elapses, leaving the remainder
 * for the next tick.
 */
import {
  getAlertsDue,
  getUser,
  filterNewTweetIds,
  markTweetsPushed,
  updateAlertLastRun,
  type AlertDict,
} from "@/lib/social-listening/db";
import { collectTweets } from "@/lib/social-listening/collectors/twitter";
import { classifyTweets } from "@/lib/social-listening/analyzers/classify";
import {
  formatAlertMessage,
  formatDigestMessage,
} from "@/lib/social-listening/telegram-formatters";
import { sendTelegramMessage } from "@/lib/news-telegram";
import type { Lang, Tweet } from "@/lib/social-listening/types";

export const MAX_PUSH_PER_RUN = 5;
export const FETCH_PER_RUN = 30;
export const DIGEST_THRESHOLD = 5;

function buildQuery(handles: string[], keywords: string[]): string {
  const parts = [
    ...handles.map((h) => `@${h.replace(/^@/, "")}`),
    ...keywords,
  ];
  if (parts.length === 1) return parts[0];
  return `(${parts.join(" OR ")})`;
}

/** Poll one alert end-to-end and push hits to Telegram. */
export async function runAlert(alertDict: AlertDict): Promise<void> {
  const alertId = alertDict.id;
  const chatId = alertDict.chat_id;
  const handles = alertDict.handles || [];
  const keywords = alertDict.keywords || [];
  const sentimentFilter = alertDict.sentiment_filter || "all";
  const urgencyFilter = alertDict.urgency_filter || "all";
  const digestMode = Boolean(alertDict.digest_mode);

  if (handles.length === 0 && keywords.length === 0) return;

  // Look up user lang + tz so the push message renders in their preferences.
  const user = await getUser(chatId);
  const userTz = user?.tz || null;
  const userLang: Lang = (user?.lang as Lang) || "zh";

  const query = buildQuery(handles, keywords);

  let tweets: Tweet[] = [];
  try {
    tweets = await collectTweets(query, FETCH_PER_RUN, "24h");
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn(
      `[scheduler] alert #${alertId} fetch failed: ${err instanceof Error ? err.message : err}`
    );
    await updateAlertLastRun(alertId);
    return;
  }

  if (tweets.length === 0) {
    await updateAlertLastRun(alertId);
    return;
  }

  // Dedupe against tweets we've already pushed for this alert.
  const allIds = tweets.map((t) => t.id).filter(Boolean);
  const newIdSet = await filterNewTweetIds(alertId, allIds);
  let newTweets = tweets.filter((t) => newIdSet.has(t.id));

  if (newTweets.length === 0) {
    await updateAlertLastRun(alertId);
    return;
  }

  // Always classify so push messages have sentiment/urgency/action/category.
  try {
    newTweets = await classifyTweets(newTweets);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn(
      `[scheduler] alert #${alertId} classify failed: ${err instanceof Error ? err.message : err}`
    );
    // If filtering would gate on classification we can't trust, drop everything
    // rather than push unfiltered noise.
    if (sentimentFilter !== "all" || urgencyFilter !== "all") {
      newTweets = [];
    }
  }

  if (sentimentFilter !== "all") {
    const wanted = new Set(
      sentimentFilter.split(",").map((s) => s.trim()).filter(Boolean)
    );
    newTweets = newTweets.filter((t) => t.sentiment && wanted.has(t.sentiment));
  }
  if (urgencyFilter !== "all") {
    const wanted = new Set(
      urgencyFilter.split(",").map((u) => u.trim()).filter(Boolean)
    );
    newTweets = newTweets.filter((t) => t.urgency && wanted.has(t.urgency));
  }

  const matchedTweetIds = newTweets.map((t) => t.id).filter(Boolean);

  if (newTweets.length > 0) {
    if (digestMode && newTweets.length >= DIGEST_THRESHOLD) {
      const msg = formatDigestMessage(
        handles,
        keywords,
        newTweets,
        userTz,
        userLang
      );
      try {
        await sendTelegramMessage(chatId, msg);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn(
          `[scheduler] alert #${alertId} digest push failed: ${err instanceof Error ? err.message : err}`
        );
      }
    } else {
      const toPush = newTweets.slice(0, MAX_PUSH_PER_RUN);
      const extra = newTweets.length - toPush.length;
      for (const t of toPush) {
        const msg = formatAlertMessage(handles, keywords, t, userTz, userLang);
        try {
          await sendTelegramMessage(chatId, msg);
        } catch (err) {
          // eslint-disable-next-line no-console
          console.warn(
            `[scheduler] alert #${alertId} push failed: ${err instanceof Error ? err.message : err}`
          );
        }
      }
      if (extra > 0) {
        const tail =
          userLang === "en"
            ? `📚 ${extra} more matching tweets not pushed this round (cap is ${MAX_PUSH_PER_RUN} per poll). Use /digest on to batch them into a single summary instead.`
            : `📚 还有 ${extra} 条匹配推文未推送（每轮上限 ${MAX_PUSH_PER_RUN} 条）。可发送 /digest on 启用摘要模式，将多条合并为一条。`;
        try {
          await sendTelegramMessage(chatId, tail);
        } catch {
          // ignore — extras notice is best-effort
        }
      }
    }
  }

  // Only mark tweets that matched the current alert filters. If the user
  // changes filters later, previously excluded tweets can still be considered.
  await markTweetsPushed(alertId, matchedTweetIds);
  await updateAlertLastRun(alertId);
}

/**
 * Tick handler. Pulls up to `limit` due alerts, processes each, and bails
 * gracefully when the per-invocation budget is exhausted (oldest-first
 * ordering ensures fairness across ticks).
 */
export async function pollAllAlerts(opts: {
  /** Wall-clock budget in ms — stop dispatching new alerts once exceeded. */
  budgetMs?: number;
  limit?: number;
} = {}): Promise<{ processed: number; remaining: number; deadlineHit: boolean }> {
  const start = Date.now();
  const budget = opts.budgetMs ?? 270_000; // 4.5min — leaves room under maxDuration=300
  const limit = opts.limit ?? 20;

  let due: AlertDict[];
  try {
    due = await getAlertsDue(limit);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn(
      `[scheduler] failed to load due alerts: ${err instanceof Error ? err.message : err}`
    );
    return { processed: 0, remaining: 0, deadlineHit: false };
  }

  let processed = 0;
  let deadlineHit = false;
  for (const alert of due) {
    const elapsed = Date.now() - start;
    // Reserve 15s for cleanup + reply latency on the last call.
    if (elapsed > budget - 15_000) {
      deadlineHit = true;
      break;
    }
    try {
      await runAlert(alert);
      processed++;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn(
        `[scheduler] alert #${alert.id} run failed: ${err instanceof Error ? err.message : err}`
      );
    }
  }
  return {
    processed,
    remaining: Math.max(0, due.length - processed),
    deadlineHit,
  };
}
