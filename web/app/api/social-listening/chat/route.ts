/**
 * POST /api/social-listening/chat
 *
 * Body: { task_id, question, history?, lang? }
 *
 * Follow-up Q&A grounded in the captured analysis. Sonnet 4.6 with prompt
 * caching on the evidence block — multi-turn calls reuse the cached prefix.
 */
import { NextRequest, NextResponse } from "next/server";
import { getTask } from "@/lib/social-listening/db";
import { answerFollowup } from "@/lib/social-listening/analyzers/chat";
import type {
  ChatTurn,
  Lang,
  Topic,
  Tweet,
} from "@/lib/social-listening/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

interface ChatBody {
  task_id: string;
  question: string;
  history?: ChatTurn[];
  lang?: Lang;
}

export async function POST(req: NextRequest) {
  let body: ChatBody;
  try {
    body = (await req.json()) as ChatBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!body.task_id || !body.question) {
    return NextResponse.json(
      { error: "task_id and question are required" },
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
  const topics = (result.topics as Topic[]) || [];
  const reportMd =
    task.report_markdown || (result.report_markdown as string) || "";
  const lang: Lang = body.lang === "en" ? "en" : "zh";

  try {
    const answer = await answerFollowup(
      body.question,
      String(result.query || ""),
      tweets,
      topics,
      reportMd,
      body.history || [],
      lang
    );
    return NextResponse.json({ answer });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
