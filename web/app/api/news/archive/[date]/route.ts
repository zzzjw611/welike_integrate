import { NextResponse } from "next/server";
import { getIssueByDate } from "@/lib/ai-marketer-news";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ date: string }> }
) {
  const { date } = await params;
  const issue = await getIssueByDate(date);
  if (!issue) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ issue });
}
