import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import pool from "@/lib/db";

// Auto-link flow step 1: mint a one-time token tied to no chat_id yet.
// CreateAlerts opens the deep_link in Telegram; the bot webhook fills in
// chat_id when the user sends "/start link_<token>". Frontend polls
// /api/social-listening/alerts/link/status to detect the binding.
//
// (Was previously a proxy to a SOCIAL_LISTENING_BACKEND microservice that
// is not deployed. Rewritten to use our own Postgres `link_tokens` table.)

export const dynamic = "force-dynamic";

const BOT_USERNAME = "WeLike_Alerts_bot";

export async function POST(req: NextRequest) {
  // The client may send { tz: "Asia/Shanghai" }; we accept and ignore — the
  // timezone is captured when the user saves the subscription via
  // /api/news/subscriptions.
  try {
    await req.json().catch(() => ({}));
  } catch {
    // ignore body parse errors
  }

  const token = randomBytes(16).toString("hex"); // 32 chars, fits VARCHAR(64)

  try {
    await pool.query(
      `INSERT INTO link_tokens (token) VALUES ($1)`,
      [token]
    );
  } catch (err) {
    console.error("[link/start] DB error", err);
    return NextResponse.json(
      { error: "Failed to create link token" },
      { status: 500 }
    );
  }

  const deep_link = `https://t.me/${BOT_USERNAME}?start=link_${token}`;
  return NextResponse.json({
    token,
    deep_link,
    expires_in_seconds: 15 * 60,
  });
}
