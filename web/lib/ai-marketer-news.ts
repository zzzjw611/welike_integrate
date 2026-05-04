import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { remark } from "remark";
import remarkHtml from "remark-html";

export type Brief = {
  title: string;
  summary: string;
  source: string;
  url?: string;
  soWhat?: string;
};

export type GrowthInsight = {
  author: string;
  handle: string;
  platform?: string;
  quote: string;
  url?: string;
  commentary?: string;
};

export type Launch = {
  product: string;
  company: string;
  category: string;
  tag?: "Big AI" | "Funded" | "Rising";
  summary: string;
  url?: string;
  funding?: string;
  metric?: string;
};

export type DailyCase = {
  company: string;
  title: string;
  deck: string;
  metrics?: string[];
  bodyHtml: string;
};

export type Highlight = {
  summary?: string;
  bullets?: string[];
};

export type Issue = {
  date: string;
  issueNumber?: number;
  editor?: string;
  highlight?: Highlight;
  briefs: Brief[];
  growth_insights: GrowthInsight[];
  launches: Launch[];
  daily_case: DailyCase;
};

export type IssueSummary = {
  date: string;
  issueNumber?: number;
  briefs: Brief[];
  growth_insights: GrowthInsight[];
  launches: Launch[];
  daily_case: { company: string; title: string; deck: string };
};

const CONTENT_DIR = path.join(process.cwd(), "content");

async function mdToHtml(md: string): Promise<string> {
  const processed = await remark().use(remarkHtml).process(md);
  return String(processed);
}

function toDateString(v: unknown, fallback: string): string {
  if (v instanceof Date) {
    const y = v.getUTCFullYear();
    const m = String(v.getUTCMonth() + 1).padStart(2, "0");
    const d = String(v.getUTCDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  if (typeof v === "string" && v.length > 0) return v;
  return fallback;
}

export async function getIssueByDate(date: string): Promise<Issue | null> {
  const filePath = path.join(CONTENT_DIR, `${date}.md`);
  let raw: string;
  try {
    raw = await fs.readFile(filePath, "utf8");
  } catch {
    return null;
  }

  const { data, content } = matter(raw);
  const bodyHtml = content.trim() ? await mdToHtml(content) : "";

  return {
    date: toDateString(data.date, date),
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
      bodyHtml,
    },
  };
}

export async function getIssueSummary(date: string): Promise<IssueSummary | null> {
  const filePath = path.join(CONTENT_DIR, `${date}.md`);
  let raw: string;
  try {
    raw = await fs.readFile(filePath, "utf8");
  } catch {
    return null;
  }
  const { data } = matter(raw);
  return {
    date: toDateString(data.date, date),
    issueNumber: data.issueNumber,
    briefs: data.briefs ?? [],
    growth_insights: data.growth_insights ?? [],
    launches: data.launches ?? [],
    daily_case: {
      company: data.daily_case?.company ?? "",
      title: data.daily_case?.title ?? "",
      deck: data.daily_case?.deck ?? "",
    },
  };
}

export async function getPreviousIssueSummaries(
  currentDate: string,
  limit = 6
): Promise<IssueSummary[]> {
  const all = await listIssues();
  const previous = all.filter((d) => d < currentDate).slice(0, limit);
  const summaries = await Promise.all(previous.map(getIssueSummary));
  return summaries.filter((s): s is IssueSummary => s !== null);
}

export async function listIssues(): Promise<string[]> {
  try {
    const files = await fs.readdir(CONTENT_DIR);
    return files
      .filter((f) => f.endsWith(".md"))
      .map((f) => f.replace(/\.md$/, ""))
      .sort((a, b) => b.localeCompare(a));
  } catch {
    return [];
  }
}

export async function getLatestIssue(): Promise<Issue | null> {
  const issues = await listIssues();
  if (issues.length === 0) return null;
  return getIssueByDate(issues[0]);
}

export async function getAdjacentIssues(
  date: string
): Promise<{ prev: string | null; next: string | null }> {
  const issues = await listIssues();
  const idx = issues.indexOf(date);
  if (idx === -1) return { prev: null, next: null };
  return {
    prev: issues[idx + 1] ?? null,
    next: issues[idx - 1] ?? null,
  };
}
