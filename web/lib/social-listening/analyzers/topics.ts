/**
 * Topic extraction + keyword cloud — TS port of backend/analyzers/topics.py.
 *
 * - extractKeywords: pure JS regex+counter aggregation (no API).
 * - extractTopics: Sonnet 4.6 with structured output (forced tool_use).
 * - clusterNarratives: Sonnet 4.6 with structured output.
 */
import {
  generateStructured,
  MODEL_SONNET,
  type JsonSchema,
} from "@/lib/social-listening/anthropic";
import type {
  Tweet,
  Topic,
  KeywordEntry,
  Narrative,
} from "@/lib/social-listening/types";

// ────────────────────────────────────────────────────────────────────────────
// Stopwords — copied verbatim from Python
// ────────────────────────────────────────────────────────────────────────────

const STOPWORDS = new Set(
  `the a an and or but if so of in on at to for with by from as is are was were be been being
this that these those i you he she it we they me him her us them my your his our their
do does did have has had will would should could can may might must shall
not no nor yes also just only very more most some any all each every both either neither
about over under up down out off into onto than then here there when where why how what who
com https http www rt via amp get got make made like want need say said see seen know new
one two three really much many lot lots still even back now today well way good great nice
i'm you're we're they're don't doesn't didn't won't can't i've we've they've`
    .split(/\s+/)
    .filter(Boolean)
);

const CHINESE_STOP = new Set(
  `的 了 是 在 我 有 和 也 就 不 都 而 及 与 或 一 个 这 那 它 他 她 我们 你们 他们 什么 怎么 哪里 那里
非常 真的 已经 还是 但是 因为 所以 如果 虽然 应该 可能 能够 可以 需要 想要 喜欢 觉得 认为 表示`
    .split(/\s+/)
    .filter(Boolean)
);

export function extractKeywords(tweets: Tweet[], topN = 30): KeywordEntry[] {
  const counter = new Map<string, number>();
  for (const t of tweets) {
    let text = (t.text || "").toLowerCase();
    text = text.replace(/https?:\/\/\S+/g, "");
    text = text.replace(/@\w+/g, "");
    const enWords = text.match(/[a-z][a-z0-9]{2,}/g) || [];
    for (const w of enWords) {
      if (!STOPWORDS.has(w)) counter.set(w, (counter.get(w) ?? 0) + 1);
    }
    const zhWords = text.match(/[一-龥]{2,4}/g) || [];
    for (const zh of zhWords) {
      if (!CHINESE_STOP.has(zh)) counter.set(zh, (counter.get(zh) ?? 0) + 1);
    }
  }
  return [...counter.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([word, count]) => ({ word, count }));
}

// ────────────────────────────────────────────────────────────────────────────
// Topics — Sonnet, structured output
// ────────────────────────────────────────────────────────────────────────────

interface TopicOutput {
  topic: string;
  count: number;
  sentiment: "positive" | "negative" | "mixed" | "neutral";
  urgency: "high" | "medium" | "low";
  action: string;
  tweet_ids: number[];
}

interface TopicsResult {
  topics: TopicOutput[];
}

const TOPICS_SCHEMA: JsonSchema = {
  type: "object",
  properties: {
    topics: {
      type: "array",
      items: {
        type: "object",
        properties: {
          topic: { type: "string", maxLength: 100 },
          count: { type: "integer", minimum: 1 },
          sentiment: {
            type: "string",
            enum: ["positive", "negative", "mixed", "neutral"],
          },
          urgency: { type: "string", enum: ["high", "medium", "low"] },
          action: { type: "string", maxLength: 200 },
          tweet_ids: {
            type: "array",
            items: { type: "integer" },
            description: "属于该话题的推文编号 (1-based)",
          },
        },
        required: [
          "topic",
          "count",
          "sentiment",
          "urgency",
          "action",
          "tweet_ids",
        ],
      },
    },
  },
  required: ["topics"],
};

function normalizeTopicOutputs(input: unknown): TopicOutput[] {
  if (!input || typeof input !== "object") return [];
  const maybeTopics = (input as { topics?: unknown }).topics;
  if (Array.isArray(maybeTopics)) return maybeTopics as TopicOutput[];
  if (maybeTopics && typeof maybeTopics === "object") {
    return Object.values(maybeTopics) as TopicOutput[];
  }
  return [];
}

export async function extractTopics(tweets: Tweet[]): Promise<Topic[]> {
  if (tweets.length === 0) return [];

  const numbered = tweets
    .map((t, i) => `${i + 1}. ${t.text.slice(0, 180)}`)
    .join("\n");

  const result = await generateStructured<TopicsResult>({
    model: MODEL_SONNET,
    system:
      "你是社交聆听话题分析师。从推文集合中抽取 top 6-8 个高信号话题，为每个话题标注情感、紧急度、推荐行动，并关联对应推文编号。",
    user: `推文列表（编号 1-based）：\n\n${numbered}`,
    schema: TOPICS_SCHEMA,
    maxTokens: 2500,
  });

  if (!result) return [];

  const maxId = tweets.length;
  return normalizeTopicOutputs(result)
    .filter((t) => t && typeof t.topic === "string")
    .map((t) => ({
      topic: t.topic,
      count: Number.isFinite(Number(t.count)) ? Number(t.count) : 1,
      sentiment: t.sentiment,
      urgency: t.urgency,
      action: typeof t.action === "string" ? t.action : "",
      tweet_ids: (Array.isArray(t.tweet_ids) ? t.tweet_ids : []).filter(
        (i) => i >= 1 && i <= maxId
      ),
    }));
}

// ────────────────────────────────────────────────────────────────────────────
// Narrative clustering — Sonnet, structured output
// ────────────────────────────────────────────────────────────────────────────

interface NarrativeOutput {
  narrative: string;
  phase: "emerging" | "heating" | "peaking" | "declining";
  reach: "high" | "medium" | "low";
  kols: string[];
  tweet_ids: number[];
  recommendation: string;
}

interface NarrativesResult {
  narratives: NarrativeOutput[];
}

const NARRATIVES_SCHEMA: JsonSchema = {
  type: "object",
  properties: {
    narratives: {
      type: "array",
      items: {
        type: "object",
        properties: {
          narrative: { type: "string", maxLength: 60 },
          phase: {
            type: "string",
            enum: ["emerging", "heating", "peaking", "declining"],
          },
          reach: { type: "string", enum: ["high", "medium", "low"] },
          kols: {
            type: "array",
            items: { type: "string" },
            description: "参与的 KOL handle，最多 3 个",
          },
          tweet_ids: {
            type: "array",
            items: { type: "integer" },
          },
          recommendation: { type: "string", maxLength: 200 },
        },
        required: [
          "narrative",
          "phase",
          "reach",
          "kols",
          "tweet_ids",
          "recommendation",
        ],
      },
    },
  },
  required: ["narratives"],
};

export async function clusterNarratives(
  tweets: Tweet[]
): Promise<Narrative[]> {
  if (tweets.length === 0) return [];

  const numbered = tweets
    .map(
      (t, i) =>
        `${i + 1}. [@${t.author_username} f=${t.author_followers ?? 0}] ${t.text.slice(0, 160)}`
    )
    .join("\n");

  const result = await generateStructured<NarrativesResult>({
    model: MODEL_SONNET,
    system: `你是一位资深传播分析师。

"叙事故事线" (narrative)：一群推文围绕同一个隐含主题形成的讨论脉络，比下面定义的"话题"更高层 —— 话题是显式关键词聚类，叙事是隐含的情感/立场主线。

生命周期阶段：
- emerging：刚冒头，讨论量少但集中
- heating：升温中，多 KOL 加入
- peaking：见顶，饱和传播
- declining：衰退，讨论热度下降

请识别 2-4 条叙事故事线。`,
    user: `推文（编号 1-based，带作者粉丝数）：\n\n${numbered}`,
    schema: NARRATIVES_SCHEMA,
    maxTokens: 2500,
  });

  if (!result) return [];

  const maxId = tweets.length;
  return result.narratives.map((n) => ({
    narrative: n.narrative,
    phase: n.phase,
    reach: n.reach,
    kols: (n.kols || []).slice(0, 3),
    tweet_ids: (n.tweet_ids || []).filter((i) => i >= 1 && i <= maxId),
    recommendation: n.recommendation,
  }));
}
