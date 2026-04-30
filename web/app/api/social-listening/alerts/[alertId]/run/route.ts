import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.SOCIAL_LISTENING_BACKEND || "http://localhost:8000";

export async function POST(req: NextRequest, { params }: { params: { alertId: string } }) {
  try {
    const body = await req.json();
    // Backend expects chat_id as query param, not body
    const chatId = body.chat_id;
    const resp = await fetch(`${BACKEND}/api/web/alerts/${params.alertId}/run?chat_id=${chatId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    const data = await resp.json();
    return NextResponse.json(data, { status: resp.status });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
