/**
 * POST /api/social-listening/report/{taskId}/generate
 *
 * On-demand strategy report generation (Sonnet 4.6). The pipeline keeps the
 * report decoupled from the analyze pass so we don't burn the most expensive
 * single LLM call on every analysis — only when the user explicitly requests
 * the strategy doc.
 *
 * Idempotent: re-calls return the existing markdown when status='done'.
 * Concurrent requests are short-circuited with status='generating'.
 */
import { NextResponse } from "next/server";
import { getTask, updateTask } from "@/lib/social-listening/db";
import { generateReport } from "@/lib/social-listening/analyzers/report";
import type {
  Tweet,
  Topic,
  SentimentCounts,
  Lang,
} from "@/lib/social-listening/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

const REPORT_LANG_MARKER = /^<!--\s*welike-report-lang:(en|zh)\s*-->\s*/;

function reportLang(markdown: string | null | undefined): Lang | null {
  const match = String(markdown || "").match(REPORT_LANG_MARKER);
  return match ? (match[1] as Lang) : null;
}

function withReportLang(markdown: string, lang: Lang): string {
  return `<!-- welike-report-lang:${lang} -->\n${markdown}`;
}

export async function POST(
  req: Request,
  { params }: { params: { taskId: string } }
) {
  const task = await getTask(params.taskId);
  if (!task || task.status !== "done") {
    return NextResponse.json(
      { error: "请先完成一次分析" },
      { status: 400 }
    );
  }
  const result = (task.result_json as Record<string, unknown> | null) || null;
  if (!result) {
    return NextResponse.json(
      { error: "Task result missing" },
      { status: 500 }
    );
  }

  let requestedLang: Lang = "zh";
  try {
    const body = (await req.json()) as { lang?: Lang };
    requestedLang = body.lang === "en" ? "en" : "zh";
  } catch {
    requestedLang = "zh";
  }

  // Already generated — short-circuit.
  if (task.report_status === "done" && task.report_markdown) {
    const existingLang = reportLang(task.report_markdown) || "zh";
    if (existingLang === requestedLang) {
      return NextResponse.json({
        status: "done",
        report_markdown: task.report_markdown,
        report_lang: existingLang,
      });
    }
    await updateTask(params.taskId, { report_status: "idle" });
  }
  if (task.report_status === "running") {
    return NextResponse.json({
      status: "generating",
      report_markdown: "",
      report_lang: requestedLang,
    });
  }

  await updateTask(params.taskId, { report_status: "running" });

  try {
    const tweets = (result.tweets as Tweet[]) || [];
    const topics = (result.topics as Topic[]) || [];
    const sentimentCounts =
      (result.sentiment_counts as SentimentCounts) || {
        positive: 0,
        negative: 0,
        neutral: 0,
      };
    const reportMd = await generateReport(
      String(result.query || ""),
      tweets,
      topics,
      sentimentCounts,
      requestedLang
    );
    const storedReportMd = withReportLang(reportMd, requestedLang);
    await updateTask(params.taskId, {
      report_status: "done",
      report_markdown: storedReportMd,
    });
    return NextResponse.json({
      status: "done",
      report_markdown: storedReportMd,
      report_lang: requestedLang,
    });
  } catch (err) {
    await updateTask(params.taskId, { report_status: "idle" }).catch(
      () => {}
    );
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: `生成报告失败：${msg}` },
      { status: 500 }
    );
  }
}
