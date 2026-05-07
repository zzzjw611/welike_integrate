import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

// Telegram-channel subscription persistence for Create Alerts.
//
//   GET    /api/news/subscriptions?chat_id=123  → current subscription (or 404)
//   POST   /api/news/subscriptions              → upsert preferences
//   DELETE /api/news/subscriptions?chat_id=123  → mark is_active=false
//
// Email channel intentionally not persisted here — it stays in localStorage
// + the manual "Send now" path. Hourly cron pushes are Telegram-only.

export const dynamic = "force-dynamic";

interface UpsertBody {
  chat_id: number | string;
  language?: "en" | "zh";
  timezone?: string;
  push_time?: string; // HH:mm
  sections?: {
    briefs: boolean;
    launches: boolean;
    growth_insights: boolean;
    daily_case: boolean;
  };
}

function normaliseTime(t: string | undefined): string {
  if (!t) return "09:00";
  // Accept "HH:mm" or "HH:mm:ss"; Postgres TIME accepts either.
  const m = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(t.trim());
  if (!m) return "09:00";
  const hh = String(Math.min(23, parseInt(m[1], 10))).padStart(2, "0");
  const mm = m[2];
  return `${hh}:${mm}`;
}

export async function GET(req: NextRequest) {
  const chatId = req.nextUrl.searchParams.get("chat_id");
  if (!chatId) {
    return NextResponse.json({ error: "chat_id required" }, { status: 400 });
  }
  try {
    const { rows } = await pool.query(
      `SELECT telegram_chat_id, language, timezone, push_time, is_active, sections
         FROM telegram_subscriptions
        WHERE telegram_chat_id = $1`,
      [String(chatId)]
    );
    if (rows.length === 0) {
      return NextResponse.json({ subscription: null }, { status: 404 });
    }
    return NextResponse.json({ subscription: rows[0] });
  } catch (err) {
    console.error("[subscriptions:GET]", err);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  let body: UpsertBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!body.chat_id) {
    return NextResponse.json({ error: "chat_id required" }, { status: 400 });
  }

  const chatId = String(body.chat_id);
  const language = body.language === "zh" ? "zh" : "en";
  const timezone = body.timezone || "Asia/Shanghai";
  const pushTime = normaliseTime(body.push_time);
  const sections = body.sections || {
    briefs: true,
    launches: true,
    growth_insights: true,
    daily_case: true,
  };

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Reuse existing user when present (e.g. /start in bot already created one),
    // otherwise lazily mint a placeholder user keyed by language only. The bot
    // and the web Create Alerts UI both converge on the same chat_id row.
    const existing = await client.query<{ user_id: string }>(
      `SELECT user_id FROM telegram_subscriptions WHERE telegram_chat_id = $1`,
      [chatId]
    );
    let userId: string;
    if (existing.rows.length > 0) {
      userId = existing.rows[0].user_id;
    } else {
      const inserted = await client.query<{ id: string }>(
        `INSERT INTO users (language) VALUES ($1) RETURNING id`,
        [language]
      );
      userId = inserted.rows[0].id;
    }

    await client.query(
      `INSERT INTO telegram_subscriptions
         (user_id, telegram_chat_id, language, timezone, push_time, sections, is_active, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, true, NOW())
       ON CONFLICT (telegram_chat_id) DO UPDATE
         SET language   = EXCLUDED.language,
             timezone   = EXCLUDED.timezone,
             push_time  = EXCLUDED.push_time,
             sections   = EXCLUDED.sections,
             is_active  = true,
             updated_at = NOW()`,
      [userId, chatId, language, timezone, pushTime, sections]
    );

    await client.query("COMMIT");
    return NextResponse.json({ ok: true, chat_id: chatId });
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("[subscriptions:POST]", err);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  } finally {
    client.release();
  }
}

export async function DELETE(req: NextRequest) {
  const chatId = req.nextUrl.searchParams.get("chat_id");
  if (!chatId) {
    return NextResponse.json({ error: "chat_id required" }, { status: 400 });
  }
  try {
    await pool.query(
      `UPDATE telegram_subscriptions
          SET is_active = false, updated_at = NOW()
        WHERE telegram_chat_id = $1`,
      [String(chatId)]
    );
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[subscriptions:DELETE]", err);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}
