/**
 * POST /api/social-listening/analyze
 *
 * Body: { query: string, time_range?: "24h"|"7d"|"14d", max_tweets?: number }
 *
 * Behaviour mirrors backend/main.py /api/analyze in welike-social-listening-main:
 *   1. 1h dedupe by (query.lower(), time_range) — duplicate calls return the
 *      same task_id with cached=true.
 *   2. Otherwise create a new sl_task row, run collect → rank → classify →
 *      topics inline, store result_json. Frontend polls /api/social-listening/
 *      status until status='done', then GETs /api/social-listening/report.
 *
 * On Vercel Pro this fits well within maxDuration=300 even for the 14d window.
 */
import { NextRequest, NextResponse } from "next/server";
import {
  createTask,
  updateTask,
  lookupDedupeTask,
} from "@/lib/social-listening/db";
import { collectTweets } from "@/lib/social-listening/collectors/twitter";
import { classifyTweets } from "@/lib/social-listening/analyzers/classify";
import {
  extractTopics,
  extractKeywords,
} from "@/lib/social-listening/analyzers/topics";
import type { Tweet, TimeRange } from "@/lib/social-listening/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

interface AnalyzeBody {
  query: string;
  time_range?: TimeRange;
  max_tweets?: number;
}

function shortId(): string {
  return Math.random().toString(36).slice(2, 10);
}

function dedupeKey(query: string, timeRange: string): string {
  return `${query.trim().toLowerCase()}|${timeRange}`;
}

function emptyResult(query: string, timeRange: string) {
  return {
    query,
    time_range: timeRange,
    tweet_count: 0,
    sentiment_counts: { positive: 0, negative: 0, neutral: 0 },
    category_counts: {},
    urgency_counts: {},
    topics: [],
    tweets: [],
    keywords: [],
    report_markdown: `# 未找到数据\n\n关键词 **${query}**（范围 ${timeRange}）内未找到相关推文。\n\n建议：\n- 使用英文关键词\n- 延长时间范围\n- 使用项目官方 X 账号链接`,
    report_status: "done" as const,
  };
}

export async function POST(req: NextRequest) {
  let body: AnalyzeBody;
  try {
    body = (await req.json()) as AnalyzeBody;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }
  const query = (body.query || "").trim();
  if (!query) {
    return NextResponse.json(
      { error: "query is required" },
      { status: 400 }
    );
  }
  const timeRange: TimeRange =
    body.time_range && ["24h", "7d", "14d"].includes(body.time_range)
      ? body.time_range
      : "7d";
  const maxTweets = Math.max(
    1,
    Math.min(100, Number(body.max_tweets) || 30)
  );

  // 1h dedupe
  const dKey = dedupeKey(query, timeRange);
  const existing = await lookupDedupeTask(dKey);
  if (existing) {
    return NextResponse.json({ task_id: existing.id, cached: true });
  }

  const taskId = shortId();
  await createTask({
    id: taskId,
    query,
    time_range: timeRange,
    max_tweets: maxTweets,
    dedupe_key: dKey,
  });

  // Inline pipeline. Errors bubble up and we mark status=error so the polling
  // frontend can render a useful message.
  try {
    await updateTask(taskId, {
      status: "running",
      progress: 8,
      message: "正在从 X 平台采集候选推文 (multi-page relevancy + recency)...",
    });

    const candidates: Tweet[] = await collectTweets(
      query,
      maxTweets,
      timeRange
    );

    if (candidates.length === 0) {
      await updateTask(taskId, {
        status: "done",
        progress: 100,
        message: "未找到相关推文",
        result_json: emptyResult(query, timeRange),
      });
      return NextResponse.json({ task_id: taskId, cached: false });
    }

    // Drop zero-engagement tweets unless that empties the pool.
    const meaningful = candidates.filter((t) => (t.engagement || 0) > 0);
    const pool = meaningful.length > 0 ? meaningful : candidates;
    pool.sort((a, b) => Number(b.engagement || 0) - Number(a.engagement || 0));
    const tweets = pool.slice(0, maxTweets);

    const topEng = tweets[0]?.engagement || 0;
    await updateTask(taskId, {
      progress: 25,
      message: `已从 ${candidates.length} 条候选中筛出 ${tweets.length} 条最热推文 (top engagement=${topEng})...`,
    });

    await updateTask(taskId, {
      progress: 40,
      message: "正在判定情感、紧急度与建议动作...",
    });
    await classifyTweets(tweets);

    await updateTask(taskId, {
      progress: 60,
      message: "正在识别叙事与热点话题...",
    });
    const topics = await extractTopics(tweets);
    const keywords = extractKeywords(tweets, 30);

    const sentimentCounts = countBy(tweets, "sentiment");
    const categoryCounts = countBy(tweets, "category");
    const urgencyCounts = countBy(tweets, "urgency");

    const result = {
      query,
      time_range: timeRange,
      tweet_count: tweets.length,
      sentiment_counts: {
        positive: sentimentCounts.positive || 0,
        negative: sentimentCounts.negative || 0,
        neutral: sentimentCounts.neutral || 0,
      },
      category_counts: categoryCounts,
      urgency_counts: urgencyCounts,
      topics,
      tweets,
      keywords,
      // Strategy report is on-demand (POST /report/{id}/generate).
      report_markdown: "",
      report_status: "idle" as const,
    };

    await updateTask(taskId, {
      status: "done",
      progress: 100,
      message: "分析完成",
      result_json: result,
    });
    return NextResponse.json({ task_id: taskId, cached: false });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await updateTask(taskId, {
      status: "error",
      progress: 0,
      message: `错误：${msg}`,
    }).catch(() => {});
    return NextResponse.json(
      { task_id: taskId, cached: false, error: msg },
      { status: 500 }
    );
  }
}

function countBy<K extends keyof Tweet>(
  tweets: Tweet[],
  key: K
): Record<string, number> {
  const out: Record<string, number> = {};
  for (const t of tweets) {
    const v = String(t[key] ?? "");
    if (!v) continue;
    out[v] = (out[v] || 0) + 1;
  }
  return out;
}
