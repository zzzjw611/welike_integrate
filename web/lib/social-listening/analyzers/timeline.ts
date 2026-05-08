/**
 * Engagement timeline + milestone inference — TS port of
 * backend/analyzers/timeline.py.
 *
 * - buildBuckets: pure JS, day-grouping by ISO date prefix.
 * - inferMilestones: Haiku 4.5 reads the top tweets from spike days and labels
 *   each with a project milestone (launch / fundraise / crisis / partnership).
 */
import {
  generateStructured,
  MODEL_HAIKU,
  type JsonSchema,
} from "@/lib/social-listening/anthropic";
import type {
  Tweet,
  TimelineBucket,
  Milestone,
} from "@/lib/social-listening/types";

function parseDay(createdAt: string): string | null {
  if (!createdAt || createdAt.length < 10) return null;
  return createdAt.slice(0, 10);
}

interface InternalBucket {
  date: string;
  count: number;
  engagement: number;
}

export function buildBuckets(tweets: Tweet[]): InternalBucket[] {
  const byDay = new Map<string, { count: number; engagement: number }>();
  for (const t of tweets) {
    const day = parseDay(t.created_at);
    if (!day) continue;
    const cur = byDay.get(day) || { count: 0, engagement: 0 };
    cur.count += 1;
    cur.engagement += Number(t.engagement || 0);
    byDay.set(day, cur);
  }
  return [...byDay.entries()]
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([date, v]) => ({
      date,
      count: v.count,
      engagement: v.engagement,
    }));
}

/** Convert internal buckets to the public TimelineBucket shape. */
export function bucketsToPublic(buckets: InternalBucket[]): TimelineBucket[] {
  return buckets.map((b) => ({
    date: b.date,
    tweets: b.count,
    engagement: b.engagement,
  }));
}

interface MilestoneOutput {
  date: string;
  title: string;
  summary: string;
}

interface MilestonesResult {
  milestones: MilestoneOutput[];
}

const MILESTONE_SCHEMA: JsonSchema = {
  type: "object",
  properties: {
    milestones: {
      type: "array",
      items: {
        type: "object",
        properties: {
          date: { type: "string", description: "ISO date YYYY-MM-DD" },
          title: {
            type: "string",
            maxLength: 40,
            description:
              "项目里程碑短标签，如 '发布 v2'、'融资' 或 '危机回应'",
          },
          summary: {
            type: "string",
            maxLength: 120,
            description: "一句话说明这个里程碑事件",
          },
        },
        required: ["date", "title", "summary"],
      },
    },
  },
  required: ["milestones"],
};

function extractOfficialHandle(query: string): string | null {
  const q = (query || "").trim();
  if (!q) return null;
  if (q.includes("twitter.com/") || q.includes("x.com/")) {
    const last = q.replace(/\/+$/, "").split("/").pop() || "";
    return last.replace(/^@/, "").toLowerCase();
  }
  if (q.startsWith("@") && !q.includes(" ")) {
    return q.slice(1).toLowerCase();
  }
  return null;
}

export interface RichMilestone extends Milestone {
  tweet_url: string;
  tweet_index: number;
  author: string;
  /** Plain-language one-line summary; mirrors Python `summary` field. */
  summary: string;
}

/**
 * Pick top-K days by engagement and label each as a project milestone.
 */
export async function inferMilestones(
  tweets: Tweet[],
  buckets: InternalBucket[],
  topK = 4,
  query = ""
): Promise<RichMilestone[]> {
  if (tweets.length === 0 || buckets.length < 2) return [];

  const spikes = [...buckets]
    .sort((a, b) => b.engagement - a.engagement)
    .slice(0, topK);
  const spikeDates = [...new Set(spikes.filter((s) => s.engagement > 0).map((s) => s.date))].sort();
  if (spikeDates.length === 0) return [];

  // Top 5 tweets per spike day, by engagement.
  const byDay = new Map<string, Tweet[]>();
  const indexByTweet = new Map<Tweet, number>(); // identity mapping
  for (let i = 0; i < tweets.length; i++) {
    const t = tweets[i];
    indexByTweet.set(t, i);
    const day = parseDay(t.created_at);
    if (!day || !spikeDates.includes(day)) continue;
    const arr = byDay.get(day) || [];
    arr.push(t);
    byDay.set(day, arr);
  }
  for (const day of byDay.keys()) {
    const arr = byDay.get(day)!;
    arr.sort((a, b) => Number(b.engagement || 0) - Number(a.engagement || 0));
    byDay.set(day, arr.slice(0, 5));
  }

  // Build evidence block.
  const blocks: string[] = [];
  for (const day of spikeDates) {
    const rows = byDay.get(day) || [];
    if (rows.length === 0) continue;
    const sample = rows
      .map(
        (r) =>
          `  - @${r.author_username || "?"} (${r.author_followers ?? 0} 粉, 互动 ${r.engagement ?? 0}): ${(r.text || "").slice(0, 160)}`
      )
      .join("\n");
    blocks.push(`## 日期 ${day}\n${sample}`);
  }
  if (blocks.length === 0) return [];

  const system =
    "你是项目动态分析师。给定几个'热度峰值日'及当日的代表性推文，请判断每天发生的最可能的项目里程碑事件（产品发布 / 融资 / 合作 / 危机 / 重大公告 / 用户增长 等）。如果某一天的推文看起来只是日常讨论而非里程碑，可以省略该日。标题简短（≤12 字），摘要客观、具体。";
  const user = `请为以下峰值日生成里程碑标签：\n\n${blocks.join("\n\n")}`;

  let parsed: MilestonesResult | null = null;
  try {
    parsed = await generateStructured<MilestonesResult>({
      model: MODEL_HAIKU,
      system,
      user,
      schema: MILESTONE_SCHEMA,
      maxTokens: 1500,
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn(
      `[timeline] milestone inference failed: ${err instanceof Error ? err.message : err}`
    );
    return [];
  }
  if (!parsed) return [];

  const official = extractOfficialHandle(query);
  function pickAnchor(rows: Tweet[]): Tweet | null {
    if (rows.length === 0) return null;
    if (official) {
      const found = rows.find(
        (r) => (r.author_username || "").toLowerCase() === official
      );
      if (found) return found;
    }
    return rows[0];
  }

  const validDates = new Set(buckets.map((b) => b.date));
  const out: RichMilestone[] = [];
  for (const m of parsed.milestones || []) {
    if (!validDates.has(m.date)) continue;
    const anchor = pickAnchor(byDay.get(m.date) || []);
    out.push({
      date: m.date,
      title: m.title,
      summary: m.summary,
      description: m.summary,
      tweet_url: anchor?.url || "",
      tweet_index: anchor ? indexByTweet.get(anchor) ?? -1 : -1,
      author: anchor?.author_username || "",
    });
  }
  return out;
}
