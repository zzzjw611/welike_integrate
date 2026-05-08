import { NextResponse } from "next/server";
import { initSchema } from "@/lib/social-listening/db";

/**
 * GET /api/social-listening/init-db
 *
 * Idempotent setup: creates the sl_user / sl_alert / sl_pushed_tweet /
 * sl_web_link / sl_task tables in the Postgres pointed at by
 * SOCIAL_LISTENING_DATABASE_URL (falls back to DATABASE_URL).
 *
 * Run once per environment after deploy:
 *
 *   curl https://<your-vercel-app>/api/social-listening/init-db
 *
 * Re-running is safe — every CREATE uses IF NOT EXISTS.
 *
 * GET (not POST) so it works from a plain browser visit.
 */
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  if (
    !process.env.SOCIAL_LISTENING_DATABASE_URL &&
    !process.env.DATABASE_URL
  ) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Neither SOCIAL_LISTENING_DATABASE_URL nor DATABASE_URL is set.",
      },
      { status: 500 }
    );
  }
  try {
    await initSchema();
    return NextResponse.json({
      ok: true,
      tables: [
        "sl_user",
        "sl_alert",
        "sl_pushed_tweet",
        "sl_web_link",
        "sl_task",
      ],
    });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}
