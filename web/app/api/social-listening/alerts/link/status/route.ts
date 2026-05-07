import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

// Auto-link flow step 2: frontend polls this endpoint until either
// `linked: true` (user pressed Start link_<token> in the bot) or
// `expired: true` (15min passed without the bot picking it up).

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  try {
    const { rows } = await pool.query<{
      telegram_chat_id: string | null;
      expired: boolean;
    }>(
      `SELECT telegram_chat_id,
              (expires_at < NOW()) AS expired
         FROM link_tokens
        WHERE token = $1`,
      [token]
    );

    if (rows.length === 0) {
      return NextResponse.json({ linked: false, chat_id: null, expired: true });
    }

    const row = rows[0];
    if (row.telegram_chat_id) {
      return NextResponse.json({
        linked: true,
        chat_id: Number(row.telegram_chat_id),
        expired: false,
      });
    }
    return NextResponse.json({
      linked: false,
      chat_id: null,
      expired: row.expired,
    });
  } catch (err) {
    console.error("[link/status] DB error", err);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}
