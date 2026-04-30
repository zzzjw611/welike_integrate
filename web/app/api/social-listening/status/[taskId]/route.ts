import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.SOCIAL_LISTENING_BACKEND || "http://localhost:8000";

export async function GET(
  _req: NextRequest,
  { params }: { params: { taskId: string } }
) {
  try {
    const resp = await fetch(`${BACKEND}/api/status/${params.taskId}`, { cache: "no-store" });
    const data = await resp.json();
    return NextResponse.json(data, { status: resp.status });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
