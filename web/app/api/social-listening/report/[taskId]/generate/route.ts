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
} from "@/lib/social-listening/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function POST(
  _req: Request,
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

  // Already generated — short-circuit.
  if (task.report_status === "done" && task.report_markdown) {
    return NextResponse.json({
      status: "done",
      report_markdown: task.report_markdown,
    });
  }
  if (task.report_status === "running") {
    return NextResponse.json({
      status: "generating",
      report_markdown: "",
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
      sentimentCounts
    );
    await updateTask(params.taskId, {
      report_status: "done",
      report_markdown: reportMd,
    });
    return NextResponse.json({
      status: "done",
      report_markdown: reportMd,
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
