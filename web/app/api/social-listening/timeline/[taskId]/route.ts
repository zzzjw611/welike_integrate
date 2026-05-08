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
import type { Tweet } from "@/lib/social-listening/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(
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
  if (task.timeline_json) {
    return NextResponse.json(task.timeline_json);
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
    String(result.query || "")
  );
  const payload = {
    buckets: bucketsToPublic(internalBuckets),
    milestones,
  };
  // Cache for next call.
  await saveTimeline(params.taskId, payload).catch(() => {});
  return NextResponse.json(payload);
}
