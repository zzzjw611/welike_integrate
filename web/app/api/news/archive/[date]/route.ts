import { NextResponse } from "next/server";
import matter from "gray-matter";
import { remark } from "remark";
import remarkHtml from "remark-html";
import { readContentFile } from "@/lib/github-storage";
import { getIssueByDate } from "@/lib/ai-marketer-news";
import type { Issue } from "@/lib/ai-marketer-news";

async function mdToHtml(md: string): Promise<string> {
  const processed = await remark().use(remarkHtml).process(md);
  return String(processed);
}

async function parseIssue(date: string, raw: string): Promise<Issue | null> {
  const { data, content } = matter(raw);
  return {
    date: date,
    issueNumber: data.issueNumber,
    editor: data.editor,
    highlight: data.highlight,
    briefs: data.briefs ?? [],
    growth_insights: data.growth_insights ?? [],
    launches: data.launches ?? [],
    daily_case: {
      company: data.daily_case?.company ?? "",
      title: data.daily_case?.title ?? "",
      deck: data.daily_case?.deck ?? "",
      metrics: data.daily_case?.metrics,
      bodyHtml: content.trim() ? await mdToHtml(content) : "",
    },
  };
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ date: string }> }
) {
  const { date } = await params;

  // Try GitHub API first (gets latest edited version)
  try {
    const raw = await readContentFile(date);
    if (raw) {
      const issue = await parseIssue(date, raw);
      return NextResponse.json({ issue });
    }
  } catch {
    // Fall through to local file system
  }

  // Fallback to local file system
  const issue = await getIssueByDate(date);
  if (!issue) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ issue });
}
