/**
 * PATCH /api/social-listening/alerts/{alertId}
 *   Body: { chat_id, sentiment_filter?, urgency_filter?, digest_mode?, active? }
 *
 * DELETE /api/social-listening/alerts/{alertId}?chat_id=...
 *
 * Both verbs verify ownership: the alert.chat_id MUST match the supplied
 * chat_id, otherwise 404 is returned (matches Python's "alert 不存在或不属于你").
 */
import { NextRequest, NextResponse } from "next/server";
import {
  getAlert,
  updateAlert,
  deleteAlert,
  normalizeMultiFilter,
  SENTIMENT_ORDER,
  URGENCY_ORDER,
  type AlertUpdate,
} from "@/lib/social-listening/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function ownOr404(
  alertId: string,
  chatId: number
): Promise<NextResponse | null> {
  const a = await getAlert(alertId);
  if (!a || a.chat_id !== chatId) {
    return NextResponse.json(
      { error: "Alert 不存在或不属于你" },
      { status: 404 }
    );
  }
  return null;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { alertId: string } }
) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!body.chat_id) {
    return NextResponse.json(
      { error: "chat_id is required" },
      { status: 400 }
    );
  }
  const guard = await ownOr404(params.alertId, Number(body.chat_id));
  if (guard) return guard;

  const fields: AlertUpdate = {};
  if (body.sentiment_filter !== undefined && body.sentiment_filter !== null) {
    const canonical = normalizeMultiFilter(
      body.sentiment_filter,
      SENTIMENT_ORDER
    );
    if (!canonical) {
      return NextResponse.json(
        {
          error: `Invalid sentiment_filter — use 'all' or CSV of ${SENTIMENT_ORDER.join(",")}`,
        },
        { status: 400 }
      );
    }
    fields.sentiment_filter = canonical;
  }
  if (body.urgency_filter !== undefined && body.urgency_filter !== null) {
    const canonical = normalizeMultiFilter(
      body.urgency_filter,
      URGENCY_ORDER
    );
    if (!canonical) {
      return NextResponse.json(
        {
          error: `Invalid urgency_filter — use 'all' or CSV of ${URGENCY_ORDER.join(",")}`,
        },
        { status: 400 }
      );
    }
    fields.urgency_filter = canonical;
  }
  if (body.digest_mode !== undefined && body.digest_mode !== null) {
    fields.digest_mode = Boolean(body.digest_mode);
  }
  if (body.active !== undefined && body.active !== null) {
    fields.active = Boolean(body.active);
  }
  if (Object.keys(fields).length === 0) {
    return NextResponse.json(
      { error: "没有要更新的字段" },
      { status: 400 }
    );
  }
  const updated = await updateAlert(params.alertId, fields);
  if (!updated) {
    return NextResponse.json(
      { error: "Alert 不存在" },
      { status: 404 }
    );
  }
  return NextResponse.json(updated);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { alertId: string } }
) {
  const chatIdRaw = req.nextUrl.searchParams.get("chat_id");
  if (!chatIdRaw) {
    return NextResponse.json(
      { error: "Missing chat_id" },
      { status: 400 }
    );
  }
  const chatId = Number(chatIdRaw);
  if (!Number.isFinite(chatId)) {
    return NextResponse.json({ error: "Invalid chat_id" }, { status: 400 });
  }
  const guard = await ownOr404(params.alertId, chatId);
  if (guard) return guard;
  await deleteAlert(params.alertId);
  return NextResponse.json({ ok: true });
}
