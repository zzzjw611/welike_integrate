import { NextRequest, NextResponse } from "next/server";

// Proxy to Social Listening FastAPI backend. The frontend polls this every
// 2s after a Connect Telegram click; backend returns { linked, chat_id,
// expired } based on whether the user has sent /start link_<token> to the
// bot yet.

const BACKEND = process.env.SOCIAL_LISTENING_BACKEND || "http://localhost:8000";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }
  try {
    const resp = await fetch(
      `${BACKEND}/api/web/link/status?token=${encodeURIComponent(token)}`
    );
    const data = await resp.json();
    return NextResponse.json(data, { status: resp.status });
  } catch (err) {
    console.error("[social-listening:link/status] backend error", err);
    return NextResponse.json(
      { error: "Backend unreachable" },
      { status: 502 }
    );
  }
}
