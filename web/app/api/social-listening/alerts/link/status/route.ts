/**
 * GET /api/social-listening/alerts/link/status?token={token}
 *
 * Frontend polls this every ~2s after clicking "Connect Telegram". Returns
 * { linked, chat_id, expired } so the UI can swap to "Connected" state once
 * the webhook has consumed the token.
 */
import { NextRequest, NextResponse } from "next/server";
import { getWebLink } from "@/lib/social-listening/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }
  const link = await getWebLink(token);
  if (!link) {
    return NextResponse.json(
      { error: "Token 无效或已过期" },
      { status: 404 }
    );
  }
  const expired = new Date(link.expires_at) < new Date();
  return NextResponse.json({
    linked: link.chat_id != null,
    chat_id: link.chat_id ? Number(link.chat_id) : null,
    expired,
  });
}
