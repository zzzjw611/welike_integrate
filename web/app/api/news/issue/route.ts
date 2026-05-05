import { NextResponse } from "next/server";
import { getLatestIssue } from "@/lib/ai-marketer-news";

export async function GET() {
  const issue = await getLatestIssue();
  if (!issue) {
    return NextResponse.json({ error: "No issue found" }, { status: 404 });
  }
  return NextResponse.json(issue);
}
