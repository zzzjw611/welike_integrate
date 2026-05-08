/**
 * POST /api/social-listening/generate-reply
 *
 * Body: { task_id, tweet_index, lang? }
 *
 * Drafts 2 reply variants for the tweet at `tweet_index` in the task's tweet
 * array. Sonnet 4.6.
 */
import { NextRequest, NextResponse } from "next/server";
import { getTask } from "@/lib/social-listening/db";
import { draftReply } from "@/lib/social-listening/analyzers/reply";
import type { Lang, Tweet } from "@/lib/social-listening/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

interface ReplyBody {
  task_id: string;
  tweet_index: number;
  lang?: Lang;
}

export async function POST(req: NextRequest) {
  let body: ReplyBody;
  try {
    body = (await req.json()) as ReplyBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!body.task_id || typeof body.tweet_index !== "number") {
    return NextResponse.json(
      { error: "task_id and tweet_index are required" },
      { status: 400 }
    );
  }
  const task = await getTask(body.task_id);
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
  const tweets = (result.tweets as Tweet[]) || [];
  if (body.tweet_index < 0 || body.tweet_index >= tweets.length) {
    return NextResponse.json(
      { error: "tweet_index 越界" },
      { status: 400 }
    );
  }
  const tweet = tweets[body.tweet_index];
  const brand = String(result.query || "");
  const lang: Lang = body.lang === "en" ? "en" : "zh";
  try {
    const draft = await draftReply(tweet, brand, lang);
    return NextResponse.json({ draft, tweet });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
