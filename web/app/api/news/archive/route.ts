import { NextResponse } from "next/server";
import { listIssues } from "@/lib/ai-marketer-news";

export const dynamic = "force-static";

export async function GET() {
  try {
    const dates = await listIssues();
    return NextResponse.json({ dates });
  } catch (e) {
    return NextResponse.json({ dates: [], error: String(e) }, { status: 500 });
  }
}
