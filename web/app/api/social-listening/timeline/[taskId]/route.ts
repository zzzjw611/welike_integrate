/**
 * GET /api/social-listening/timeline/{taskId}
 *
 * Lazily computes per-day engagement buckets + LLM-inferred milestones for a
 * completed analysis. First call invokes Haiku; subsequent calls return the
 * cached payload from sl_task.timeline_json.
 */
import { NextResponse } from "next/server";
import { getTask, saveTimeline } from "@/lib/social-listening/db";
import {
  buildBuckets,
  bucketsToPublic,
  inferMilestones,
} from "@/lib/social-listening/analyzers/timeline";
import type { Tweet, Lang } from "@/lib/social-listening/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(
  req: Request,
  { params }: { params: { taskId: string } }
) {
  const url = new URL(req.url);
  const lang: Lang = url.searchParams.get("lang") === "en" ? "en" : "zh";
  const task = await getTask(params.taskId);
  if (!task || task.status !== "done") {
    return NextResponse.json(
      { error: "请先完成一次分析" },
      { status: 400 }
    );
  }
  const cached = task.timeline_json as
    | (Record<string, unknown> & { lang?: Lang })
    | null;
  if (cached && cached.lang === lang) {
    return NextResponse.json(cached);
  }
  const result = (task.result_json as Record<string, unknown> | null) || null;
  if (!result) {
    return NextResponse.json(
      { error: "Task result missing" },
      { status: 500 }
    );
  }
  const tweets = (result.tweets as Tweet[]) || [];
  const internalBuckets = buildBuckets(tweets);
  const milestones = await inferMilestones(
    tweets,
    internalBuckets,
    4,
    String(result.query || ""),
    lang
  );
  const payload = {
    lang,
    buckets: bucketsToPublic(internalBuckets),
    milestones,
  };
  // Cache for next call.
  await saveTimeline(params.taskId, payload).catch(() => {});
  return NextResponse.json(payload);
}
