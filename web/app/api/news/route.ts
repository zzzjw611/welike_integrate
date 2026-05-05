import { NextRequest, NextResponse } from "next/server";

const DEEPSEEK_BASE = "https://api.deepseek.com/v1";

export async function POST(req: NextRequest) {
  const body = await req.json();

  // If client explicitly requests a non-DeepSeek model, pass through
  const model = body.model || "deepseek-chat";

  const res = await fetch(`${DEEPSEEK_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({ ...body, model }),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
