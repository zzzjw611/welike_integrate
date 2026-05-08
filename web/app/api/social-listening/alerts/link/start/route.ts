/**
 * POST /api/social-listening/alerts/link/start
 * Body: { tz?: string }
 *
 * Mints a one-time pairing token + Telegram deep link. The deep link looks
 * like https://t.me/<bot>?start=<token>; when the user taps it and presses
 * Start in Telegram, our webhook calls consumeWebLink(token, chat_id) and
 * the user's web session can poll /link/status to see chat_id appear.
 */
import { NextRequest, NextResponse } from "next/server";
import { createWebLink } from "@/lib/social-listening/db";
import { getBotUsername } from "@/lib/social-listening/telegram-formatters";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface LinkStartBody {
  tz?: string | null;
}

export async function POST(req: NextRequest) {
  if (!process.env.TELEGRAM_BOT_TOKEN) {
    return NextResponse.json(
      { error: "Telegram bot 未配置" },
      { status: 503 }
    );
  }
  let body: LinkStartBody = {};
  try {
    body = (await req.json()) as LinkStartBody;
  } catch {
    body = {};
  }
  const tz = body.tz || null;
  const token = await createWebLink(tz);
  const botUsername = await getBotUsername();
  const deepLink = botUsername
    ? `https://t.me/${botUsername}?start=${token}`
    : null;
  return NextResponse.json({
    token,
    deep_link: deepLink,
    bot_username: botUsername,
  });
}
