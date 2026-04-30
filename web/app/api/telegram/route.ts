import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { token, chatId, text } = await req.json();
  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML", disable_web_page_preview: true }),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
