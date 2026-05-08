/**
 * GET /api/social-listening/alerts/me?chat_id={chatId}
 *
 * Returns the user's profile + their alerts. Used by the frontend to verify
 * a stored chat_id and hydrate the Smart Alerts list.
 */
import { NextRequest, NextResponse } from "next/server";
import {
  getUser,
  getUserAlerts,
  MAX_ALERTS_PER_USER,
} from "@/lib/social-listening/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const chatIdRaw = req.nextUrl.searchParams.get("chat_id");
  if (!chatIdRaw) {
    return NextResponse.json({ error: "Missing chat_id" }, { status: 400 });
  }
  const chatId = Number(chatIdRaw);
  if (!Number.isFinite(chatId)) {
    return NextResponse.json({ error: "Invalid chat_id" }, { status: 400 });
  }
  const user = await getUser(chatId);
  if (!user) {
    return NextResponse.json({ error: "Chat ID 未绑定" }, { status: 404 });
  }
  const alerts = await getUserAlerts(chatId);
  return NextResponse.json({
    chat_id: chatId,
    username: user.username,
    first_name: user.first_name,
    lang: user.lang,
    tz: user.tz,
    alerts,
    max_alerts: MAX_ALERTS_PER_USER,
  });
}
