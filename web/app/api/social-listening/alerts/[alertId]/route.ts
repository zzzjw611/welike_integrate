import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.SOCIAL_LISTENING_BACKEND || "http://localhost:8000";

export async function PATCH(req: NextRequest, { params }: { params: { alertId: string } }) {
  try {
    const body = await req.json();
    const resp = await fetch(`${BACKEND}/api/web/alerts/${params.alertId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await resp.json();
    return NextResponse.json(data, { status: resp.status });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { alertId: string } }) {
  try {
    const chatId = req.nextUrl.searchParams.get("chat_id");
    if (!chatId) {
      return NextResponse.json({ error: "Missing chat_id" }, { status: 400 });
    }
    const resp = await fetch(`${BACKEND}/api/web/alerts/${params.alertId}?chat_id=${chatId}`, {
      method: "DELETE",
    });
    const data = await resp.json();
    return NextResponse.json(data, { status: resp.status });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
