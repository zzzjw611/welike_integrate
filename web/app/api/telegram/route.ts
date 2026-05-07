import { NextRequest, NextResponse } from "next/server";
import { sendTelegramMessage } from "@/lib/news-telegram";

// Server-side Telegram sendMessage proxy. Reads the bot token from
// TELEGRAM_BOT_TOKEN env var so it never lands in the client bundle. Clients
// only need to pass chat_id + text.
//
// Backwards-compat: if a `token` field is supplied in the body it's IGNORED —
// we always use the server-side env token. (Older callers may still set it.)

export async function POST(req: NextRequest) {
  let body: { chatId?: string | number; text?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { chatId, text } = body;
  if (!chatId || !text) {
    return NextResponse.json(
      { error: "chatId and text are required" },
      { status: 400 }
    );
  }

  const result = await sendTelegramMessage(chatId, text);
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
