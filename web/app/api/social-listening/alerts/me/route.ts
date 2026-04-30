import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.SOCIAL_LISTENING_BACKEND || "http://localhost:8000";

export async function GET(req: NextRequest) {
  try {
    const chatId = req.nextUrl.searchParams.get("chat_id");
    if (!chatId) {
      return NextResponse.json({ error: "Missing chat_id" }, { status: 400 });
    }
    const resp = await fetch(`${BACKEND}/api/web/me?chat_id=${chatId}`);
    const data = await resp.json();
    return NextResponse.json(data, { status: resp.status });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
