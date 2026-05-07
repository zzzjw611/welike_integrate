import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { remark } from "remark";
import remarkHtml from "remark-html";

// Bilingual fields (`*_zh`) are optional — older issues authored before the
// bilingual prompt was rolled out (2026-05 and earlier) won't have them.
// Renderers should fall back to the English field when `_zh` is missing.
//
// Re-exported from ./ai-marketer-news-shared so server callers keep working,
// but client components MUST import directly from the shared file to avoid
// dragging fs/path into the browser bundle.

export { pickLang, type Lang } from "./ai-marketer-news-shared";

export type Brief = {
  title: string;
  title_zh?: string;
  summary: string;
  summary_zh?: string;
  source: string;
  url?: string;
  soWhat?: string;
  soWhat_zh?: string;
};

export type GrowthInsight = {
  author: string;
  handle: string;
  platform?: string;
  quote: string;
  quote_zh?: string;
  url?: string;
  commentary?: string;
  commentary_zh?: string;
};

export type Launch = {
  product: string;
  company: string;
  category: string;
  tag?: "Big AI" | "Funded" | "Rising";
  summary: string;
  summary_zh?: string;
  url?: string;
  funding?: string;
  metric?: string;
};

export type DailyCase = {
  company: string;
  title: string;
  title_zh?: string;
  deck: string;
  deck_zh?: string;
  metrics?: string[];
  metrics_zh?: string[];
  bodyHtml: string;
  bodyHtml_zh?: string;
};

export type Highlight = {
  summary?: string;
  bullets?: string[];
  bullets_zh?: string[];
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

  // body_zh lives inside frontmatter as a YAML block-scalar string. Process
  // it through remark only if the prompt produced one.
  const bodyZhRaw =
    typeof data.daily_case?.body_zh === "string" ? data.daily_case.body_zh : "";
  const bodyHtml_zh = bodyZhRaw.trim() ? await mdToHtml(bodyZhRaw) : undefined;

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
      title_zh: data.daily_case?.title_zh,
      deck: data.daily_case?.deck ?? "",
      deck_zh: data.daily_case?.deck_zh,
      metrics: data.daily_case?.metrics,
      metrics_zh: data.daily_case?.metrics_zh,
      bodyHtml,
      bodyHtml_zh,
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
  const all = await listPublishedIssues();
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

// Drafts live in web/content/drafts/ and are intentionally excluded by the
// listIssues() readdir filter (only top-level *.md is returned). The
// pipeline/publish.py script promotes a draft by moving the file out of
// drafts/ — once it lands in CONTENT_DIR it is automatically considered
// published. No frontmatter `published` flag is required.
export async function listPublishedIssues(): Promise<string[]> {
  return listIssues();
}

export async function getAdjacentIssues(
  date: string
): Promise<{ prev: string | null; next: string | null }> {
  const issues = await listPublishedIssues();
  const idx = issues.indexOf(date);
  if (idx === -1) return { prev: null, next: null };
  return {
    prev: issues[idx + 1] ?? null,
    next: issues[idx - 1] ?? null,
  };
}
