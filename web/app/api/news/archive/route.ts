import { NextResponse } from "next/server";
import { listPublishedIssues } from "@/lib/ai-marketer-news";

export const dynamic = "force-dynamic";

// Returns the list of published issues, sorted newest-first.
// Drafts (web/content/drafts/*.md) are excluded — they only become visible
// once pipeline/publish.py promotes them out of the drafts directory.
export async function GET() {
  try {
    const dates = await listPublishedIssues();
    const issues = dates.map((date) => ({ date, published: true }));
    return NextResponse.json({ issues });
  } catch (e) {
    return NextResponse.json({ issues: [], error: String(e) }, { status: 500 });
  }
}
