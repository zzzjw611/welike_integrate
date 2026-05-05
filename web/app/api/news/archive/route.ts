import { NextResponse } from "next/server";
import { listPublishedIssues, listIssues } from "@/lib/ai-marketer-news";

export const dynamic = "force-static";

export async function GET() {
  try {
    // Return only published issues for the public archive
    const dates = await listPublishedIssues();
    return NextResponse.json({ dates });
  } catch (e) {
    return NextResponse.json({ dates: [], error: String(e) }, { status: 500 });
  }
}
