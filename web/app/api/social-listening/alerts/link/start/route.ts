import { NextRequest, NextResponse } from "next/server";

// Proxy to the Social Listening FastAPI backend (deployed on Railway). The
// backend mints a one-time token, stores it in its own DB (SQLite), and
// returns a deep_link that opens @WeLike_SL_bot with `/start link_<token>`.
//
// The bot username is decided server-side by the FastAPI backend's env
// (TELEGRAM_BOT_USERNAME), not hardcoded here.
//
// Set SOCIAL_LISTENING_BACKEND in Vercel env to your Railway public URL.

const BACKEND = process.env.SOCIAL_LISTENING_BACKEND || "http://localhost:8000";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const resp = await fetch(`${BACKEND}/api/web/link/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await resp.json();
    return NextResponse.json(data, { status: resp.status });
  } catch (err) {
    console.error("[social-listening:link/start] backend error", err);
    return NextResponse.json(
      { error: "Backend unreachable" },
      { status: 502 }
    );
  }
}
