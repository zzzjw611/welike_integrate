/**
 * POST /api/social-listening/alerts/{alertId}/run
 * Body: { chat_id }
 *
 * Manually trigger an immediate poll for this alert (skips the 10-min wait).
 * Mirrors POST /api/web/alerts/{alertId}/run in backend/main.py.
 */
import { NextRequest, NextResponse } from "next/server";
import { getAlert } from "@/lib/social-listening/db";
import { runAlert } from "@/lib/social-listening/scheduler";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(
  req: NextRequest,
  { params }: { params: { alertId: string } }
) {
  let body: { chat_id?: number };
  try {
    body = (await req.json()) as { chat_id?: number };
  } catch {
    body = {};
  }
  const chatId = Number(
    body.chat_id ?? req.nextUrl.searchParams.get("chat_id")
  );
  if (!chatId) {
    return NextResponse.json(
      { error: "chat_id is required" },
      { status: 400 }
    );
  }
  const alert = await getAlert(params.alertId);
  if (!alert || alert.chat_id !== chatId) {
    return NextResponse.json(
      { error: "Alert 不存在或不属于你" },
      { status: 404 }
    );
  }
  try {
    await runAlert(alert);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
  // Reload to get updated last_run_at
  const refreshed = await getAlert(params.alertId);
  return NextResponse.json({ ok: true, alert: refreshed });
}
