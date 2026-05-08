/**
 * GET /api/social-listening/cron/poll-alerts
 *
 * Vercel Cron entry point. Configured via vercel.json with a 10-minute cron
 * (schedule: every 10 minutes), pointing at this path.
 *
 * Vercel calls this with `Authorization: Bearer <CRON_SECRET>` (system env).
 * We validate the bearer to keep this endpoint inaccessible from the public
 * internet.
 *
 * Each invocation processes up to 20 due alerts under a wall-clock budget;
 * stragglers wait for the next tick (oldest-first ordering preserves
 * fairness).
 */
import { NextRequest, NextResponse } from "next/server";
import { pollAllAlerts } from "@/lib/social-listening/scheduler";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function GET(req: NextRequest) {
  // Vercel Cron sets Authorization to `Bearer <CRON_SECRET>` automatically when
  // CRON_SECRET is set in env vars. Manual curl tests must do the same.
  const expected = process.env.CRON_SECRET;
  if (expected) {
    const auth = req.headers.get("authorization") || "";
    if (auth !== `Bearer ${expected}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
  }
  try {
    const result = await pollAllAlerts({ budgetMs: 270_000, limit: 20 });
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
