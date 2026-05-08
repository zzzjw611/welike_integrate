/**
 * POST /api/social-listening/alerts
 *
 * Body: { chat_id, handles[], keywords[], sentiment_filter?, urgency_filter?, digest_mode? }
 *
 * Creates a Smart Alert. Enforces MAX_ALERTS_PER_USER, validates the
 * multi-select filters, and sends a Telegram DM confirmation.
 */
import { NextRequest, NextResponse } from "next/server";
import {
  createAlert,
  countUserAlerts,
  getUser,
  MAX_ALERTS_PER_USER,
  normalizeMultiFilter,
  SENTIMENT_ORDER,
  URGENCY_ORDER,
} from "@/lib/social-listening/db";
import { sendTelegramMessage } from "@/lib/news-telegram";
import { formatAlertConfirmation } from "@/lib/social-listening/telegram-formatters";
import type { Lang } from "@/lib/social-listening/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface AlertBody {
  chat_id: number;
  handles?: string[];
  keywords?: string[];
  sentiment_filter?: string;
  urgency_filter?: string;
  digest_mode?: boolean;
}

export async function POST(req: NextRequest) {
  let body: AlertBody;
  try {
    body = (await req.json()) as AlertBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!body.chat_id) {
    return NextResponse.json(
      { error: "chat_id is required" },
      { status: 400 }
    );
  }

  const user = await getUser(body.chat_id);
  if (!user) {
    return NextResponse.json(
      { error: "Chat ID 未绑定，请先在 Telegram 完成连接" },
      { status: 403 }
    );
  }

  const existing = await countUserAlerts(body.chat_id);
  if (existing >= MAX_ALERTS_PER_USER) {
    return NextResponse.json(
      {
        error: `已达上限（${MAX_ALERTS_PER_USER} 个 alert）。请先删除旧的再创建。`,
      },
      { status: 409 }
    );
  }

  const handles = (body.handles || [])
    .map((h) => String(h).trim().replace(/^@/, ""))
    .filter(Boolean);
  const keywords = (body.keywords || [])
    .map((k) => String(k).trim())
    .filter(Boolean);
  if (handles.length === 0 && keywords.length === 0) {
    return NextResponse.json(
      { error: "至少要提供一个 handle 或关键词" },
      { status: 400 }
    );
  }

  const sentimentFilter = normalizeMultiFilter(
    body.sentiment_filter || "all",
    SENTIMENT_ORDER
  );
  if (!sentimentFilter) {
    return NextResponse.json(
      {
        error: `Invalid sentiment_filter — use 'all', a single option, or CSV of ${SENTIMENT_ORDER.join(",")}`,
      },
      { status: 400 }
    );
  }
  const urgencyFilter = normalizeMultiFilter(
    body.urgency_filter || "all",
    URGENCY_ORDER
  );
  if (!urgencyFilter) {
    return NextResponse.json(
      {
        error: `Invalid urgency_filter — use 'all', a single option, or CSV of ${URGENCY_ORDER.join(",")}`,
      },
      { status: 400 }
    );
  }

  const alert = await createAlert(
    body.chat_id,
    handles,
    keywords,
    sentimentFilter,
    urgencyFilter,
    Boolean(body.digest_mode)
  );

  // Fire-and-forget Telegram confirmation. Failure should NOT fail the API,
  // mirroring backend/main.py.
  try {
    const lang: Lang = (user.lang as Lang) || "zh";
    await sendTelegramMessage(
      body.chat_id,
      formatAlertConfirmation(alert, lang, "web")
    );
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn(
      `[alerts] failed to send Telegram confirmation: ${err instanceof Error ? err.message : err}`
    );
  }

  return NextResponse.json(alert);
}
