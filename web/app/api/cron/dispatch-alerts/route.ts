import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getLatestIssue } from "@/lib/ai-marketer-news";
import {
  formatIssueForTelegram,
  sendTelegramMessage,
  type AlertSections,
} from "@/lib/news-telegram";

// Hourly Vercel Cron — pushes the latest issue to every active Telegram
// subscriber whose configured `push_time` (in their `timezone`) falls within a
// ±35-minute window of "now". `news_push_log` enforces idempotency so the same
// chat × issue_date pair only ever receives one push, even if the cron fires
// twice or someone hits the endpoint manually.
//
// Auth: Vercel Cron sends an `Authorization: Bearer ${CRON_SECRET}` header
// when CRON_SECRET is set. In dev we accept the request unconditionally so
// `curl localhost:3000/api/cron/dispatch-alerts` works for testing.

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const WINDOW_MINUTES = 35;

interface SubscriptionRow {
  telegram_chat_id: string;
  language: "en" | "zh";
  timezone: string;
  push_time: string; // "HH:MM:SS" from Postgres TIME
  sections: AlertSections | null;
}

// Compute the user's local "HH:MM" right now, given their IANA timezone.
function localHHmm(tz: string, now: Date): { hour: number; minute: number } {
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: tz,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = fmt.formatToParts(now);
  const hour = parseInt(parts.find((p) => p.type === "hour")?.value ?? "0", 10);
  const minute = parseInt(
    parts.find((p) => p.type === "minute")?.value ?? "0",
    10
  );
  return { hour, minute };
}

// Difference in minutes between two HH:MM clock readings, taking wraparound
// at midnight into account so 23:50 vs 00:10 reports 20 minutes, not 1430.
function minuteDistance(
  a: { hour: number; minute: number },
  b: { hour: number; minute: number }
): number {
  const am = a.hour * 60 + a.minute;
  const bm = b.hour * 60 + b.minute;
  const raw = Math.abs(am - bm);
  return Math.min(raw, 24 * 60 - raw);
}

function parsePushTime(t: string): { hour: number; minute: number } {
  const m = /^(\d{2}):(\d{2})/.exec(t);
  return {
    hour: m ? parseInt(m[1], 10) : 9,
    minute: m ? parseInt(m[2], 10) : 0,
  };
}

async function authorize(req: NextRequest): Promise<boolean> {
  const expected = process.env.CRON_SECRET;
  if (!expected) return true; // dev or no secret configured
  const auth = req.headers.get("authorization") || "";
  return auth === `Bearer ${expected}`;
}

export async function GET(req: NextRequest) {
  if (!(await authorize(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const issue = await getLatestIssue();
  if (!issue) {
    return NextResponse.json({ ok: true, dispatched: 0, reason: "no issue" });
  }

  let subs: SubscriptionRow[];
  try {
    const result = await pool.query<SubscriptionRow>(
      `SELECT telegram_chat_id, language, timezone,
              to_char(push_time, 'HH24:MI:SS') AS push_time,
              sections
         FROM telegram_subscriptions
        WHERE is_active = true`
    );
    subs = result.rows;
  } catch (err) {
    console.error("[cron:dispatch-alerts] DB error", err);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }

  const now = new Date();
  const dispatched: string[] = [];
  const skipped: { chat_id: string; reason: string }[] = [];
  const failed: { chat_id: string; error: string }[] = [];

  for (const sub of subs) {
    const local = localHHmm(sub.timezone, now);
    const target = parsePushTime(sub.push_time);
    const dist = minuteDistance(local, target);

    if (dist > WINDOW_MINUTES) {
      skipped.push({ chat_id: sub.telegram_chat_id, reason: `dist ${dist}m` });
      continue;
    }

    // Idempotent insert into the push log; if a row already exists we silently
    // skip — same chat already received today's issue.
    const inserted = await pool.query(
      `INSERT INTO news_push_log (telegram_chat_id, issue_date)
       VALUES ($1, $2)
       ON CONFLICT (telegram_chat_id, issue_date) DO NOTHING
       RETURNING telegram_chat_id`,
      [sub.telegram_chat_id, issue.date]
    );
    if (inserted.rowCount === 0) {
      skipped.push({
        chat_id: sub.telegram_chat_id,
        reason: "already-sent",
      });
      continue;
    }

    const sections: AlertSections = sub.sections ?? {
      briefs: true,
      launches: true,
      growth_insights: true,
      daily_case: true,
    };
    const text = formatIssueForTelegram(issue, sections);
    const send = await sendTelegramMessage(sub.telegram_chat_id, text);

    if (send.ok) {
      dispatched.push(sub.telegram_chat_id);
    } else {
      // Roll back the log entry so the next cron tick can retry.
      await pool
        .query(
          `DELETE FROM news_push_log
            WHERE telegram_chat_id = $1 AND issue_date = $2`,
          [sub.telegram_chat_id, issue.date]
        )
        .catch(() => {});
      failed.push({
        chat_id: sub.telegram_chat_id,
        error: send.error ?? "unknown",
      });
    }
  }

  return NextResponse.json({
    ok: true,
    issue_date: issue.date,
    examined: subs.length,
    dispatched: dispatched.length,
    skipped: skipped.length,
    failed: failed.length,
    detail: { dispatched, skipped, failed },
  });
}
