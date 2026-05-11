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
  Lang,
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
  topic?: string;
  topic_zh?: string;
  topic_en?: string;
  count: number;
  sentiment: "positive" | "negative" | "mixed" | "neutral";
  urgency: "high" | "medium" | "low";
  action?: string;
  action_zh?: string;
  action_en?: string;
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
          topic_zh: {
            type: "string",
            maxLength: 100,
            description: "中文话题标题；产品名和专有名词可保留英文。",
          },
          topic_en: {
            type: "string",
            maxLength: 100,
            description: "English topic title; keep proper nouns unchanged.",
          },
          count: { type: "integer", minimum: 1 },
          sentiment: {
            type: "string",
            enum: ["positive", "negative", "mixed", "neutral"],
          },
          urgency: { type: "string", enum: ["high", "medium", "low"] },
          action: { type: "string", maxLength: 200 },
          action_zh: {
            type: "string",
            maxLength: 200,
            description: "中文推荐行动；产品名和专有名词可保留英文。",
          },
          action_en: {
            type: "string",
            maxLength: 200,
            description: "English recommended action; keep proper nouns unchanged.",
          },
          tweet_ids: {
            type: "array",
            items: { type: "integer" },
            description: "属于该话题的推文编号 (1-based)",
          },
        },
        required: [
          "topic",
          "topic_zh",
          "topic_en",
          "count",
          "sentiment",
          "urgency",
          "action",
          "action_zh",
          "action_en",
          "tweet_ids",
        ],
      },
    },
  },
  required: ["topics"],
};

function normalizeTopicOutputs(input: unknown): TopicOutput[] {
  if (Array.isArray(input)) return input as TopicOutput[];
  if (!input || typeof input !== "object") return [];
  const obj = input as {
    topics?: unknown;
    results?: unknown;
    items?: unknown;
  };
  const maybeTopics = obj.topics ?? obj.results ?? obj.items;
  if (Array.isArray(maybeTopics)) return maybeTopics as TopicOutput[];
  if (maybeTopics && typeof maybeTopics === "object") {
    return Object.values(maybeTopics) as TopicOutput[];
  }
  return [];
}

function pickTopicTitle(t: TopicOutput): string {
  return String(t.topic || t.topic_zh || t.topic_en || "").trim();
}

function pickTopicAction(t: TopicOutput): string {
  return String(t.action || t.action_zh || t.action_en || "").trim();
}

function validSentiment(value: unknown): Topic["sentiment"] {
  return ["positive", "negative", "mixed", "neutral"].includes(String(value))
    ? (value as Topic["sentiment"])
    : "neutral";
}

function validUrgency(value: unknown): Topic["urgency"] {
  return ["high", "medium", "low"].includes(String(value))
    ? (value as Topic["urgency"])
    : "low";
}

function normalizeTopicsResult(result: unknown, tweets: Tweet[], lang: Lang): Topic[] {
  const maxId = tweets.length;
  const topics: Array<Topic | null> = normalizeTopicOutputs(result)
    .map((t): Topic | null => {
      const title = pickTopicTitle(t);
      if (!title) return null;
      const action = pickTopicAction(t);
      const tweetIds = (Array.isArray(t.tweet_ids) ? t.tweet_ids : [])
        .map((i) => Number(i))
        .filter((i) => Number.isInteger(i) && i >= 1 && i <= maxId);
      return {
        topic:
          lang === "en"
            ? t.topic_en || t.topic || title
            : t.topic_zh || t.topic || title,
        topic_zh: t.topic_zh || t.topic || title,
        topic_en: t.topic_en || t.topic || title,
        count: Number.isFinite(Number(t.count))
          ? Number(t.count)
          : Math.max(1, tweetIds.length),
        sentiment: validSentiment(t.sentiment),
        urgency: validUrgency(t.urgency),
        action:
          lang === "en"
            ? t.action_en || t.action || action
            : t.action_zh || t.action || action,
        action_zh: t.action_zh || t.action || action,
        action_en: t.action_en || t.action || action,
        tweet_ids: tweetIds,
      };
    });
  return topics.filter((topic): topic is Topic => topic !== null);
}

const CATEGORY_LABELS: Record<string, { zh: string; en: string }> = {
  key_voice: { zh: "关键声音集中讨论", en: "Key voices driving the conversation" },
  feature_request: { zh: "功能需求与期待", en: "Feature requests and expectations" },
  bug_issue: { zh: "问题反馈与使用阻力", en: "Issues and usage friction" },
  competitor: { zh: "竞品对比与替代选择", en: "Competitor comparisons and alternatives" },
  general: { zh: "泛讨论与品牌提及", en: "General discussion and brand mentions" },
};

function fallbackAction(
  label: { zh: string; en: string },
  urgency: Topic["urgency"],
  lang: Lang
): { zh: string; en: string } {
  const urgentZh = urgency === "high" ? "优先" : "持续";
  const urgentEn = urgency === "high" ? "Prioritize" : "Monitor";
  return {
    zh: `${urgentZh}查看相关声音，提炼可回应的信息点，并同步到产品/市场动作。`,
    en: `${urgentEn} the related voices, extract response angles, and route them into product or GTM actions.`,
  };
}

function buildFallbackTopics(tweets: Tweet[], lang: Lang): Topic[] {
  const groups = new Map<string, { tweets: Array<{ tweet: Tweet; id: number }>; score: number }>();

  tweets.forEach((tweet, index) => {
    const category = tweet.category || "general";
    const key = category;
    const urgencyBoost = tweet.urgency === "high" ? 500 : tweet.urgency === "medium" ? 150 : 0;
    const sentimentBoost = tweet.sentiment === "negative" ? 120 : tweet.sentiment === "positive" ? 60 : 0;
    const score = Number(tweet.engagement || 0) + urgencyBoost + sentimentBoost;
    const group = groups.get(key) || { tweets: [], score: 0 };
    group.tweets.push({ tweet, id: index + 1 });
    group.score += score;
    groups.set(key, group);
  });

  const topics = [...groups.entries()]
    .sort((a, b) => b[1].score - a[1].score)
    .slice(0, 6)
    .map(([category, group]) => {
      const sorted = group.tweets.sort(
        (a, b) => Number(b.tweet.engagement || 0) - Number(a.tweet.engagement || 0)
      );
      const label = CATEGORY_LABELS[category] || CATEGORY_LABELS.general;
      const highCount = sorted.filter((item) => item.tweet.urgency === "high").length;
      const negativeCount = sorted.filter((item) => item.tweet.sentiment === "negative").length;
      const positiveCount = sorted.filter((item) => item.tweet.sentiment === "positive").length;
      const urgency: Topic["urgency"] =
        highCount > 0 ? "high" : sorted.some((item) => item.tweet.urgency === "medium") ? "medium" : "low";
      const sentiment: Topic["sentiment"] =
        negativeCount > positiveCount
          ? "negative"
          : positiveCount > negativeCount
            ? "positive"
            : "neutral";
      const action = fallbackAction(label, urgency, lang);
      return {
        topic: lang === "en" ? label.en : label.zh,
        topic_zh: label.zh,
        topic_en: label.en,
        count: sorted.length,
        sentiment,
        urgency,
        action: lang === "en" ? action.en : action.zh,
        action_zh: action.zh,
        action_en: action.en,
        tweet_ids: sorted.slice(0, 8).map((item) => item.id),
      };
    });

  if (topics.length > 0) return topics;

  const keywords = extractKeywords(tweets, 1);
  const keyword = keywords[0]?.word || (lang === "en" ? "Market conversation" : "市场声音");
  return [{
    topic: lang === "en" ? `${keyword} market signals` : `${keyword} 相关市场声音`,
    topic_zh: `${keyword} 相关市场声音`,
    topic_en: `${keyword} market signals`,
    count: tweets.length,
    sentiment: "neutral",
    urgency: tweets.some((tweet) => tweet.urgency === "high") ? "high" : "low",
    action:
      lang === "en"
        ? "Review the highest-engagement voices and identify which ones need response, amplification, or product follow-up."
        : "查看高互动声音，判断哪些需要回应、放大或同步产品跟进。",
    action_zh: "查看高互动声音，判断哪些需要回应、放大或同步产品跟进。",
    action_en: "Review the highest-engagement voices and identify which ones need response, amplification, or product follow-up.",
    tweet_ids: tweets.slice(0, 8).map((_, index) => index + 1),
  }];
}

function topicsSystemPrompt(lang: Lang): string {
  if (lang === "en") {
    return "You are a social listening topic analyst. Extract the top 6-8 high-signal topics from the tweet set. For each topic, label sentiment, urgency, recommended action, and related tweet ids. Return both Chinese and English versions of topic and action. Set topic/action to English. Keep product names and proper nouns unchanged.";
  }
  return "你是社交聆听话题分析师。从推文集合中抽取 top 6-8 个高信号话题，为每个话题标注情感、紧急度、推荐行动，并关联对应推文编号。请同时输出 topic_zh/topic_en 和 action_zh/action_en；topic/action 使用中文。中文里产品名、平台名、人名等专有名词可以保留英文。";
}

export async function extractTopics(
  tweets: Tweet[],
  lang: Lang = "zh"
): Promise<Topic[]> {
  if (tweets.length === 0) return [];

  const numbered = tweets
    .map((t, i) => `${i + 1}. ${t.text.slice(0, 180)}`)
    .join("\n");

  try {
    const result = await generateStructured<TopicsResult>({
      model: MODEL_SONNET,
      system: topicsSystemPrompt(lang),
      user:
        lang === "en"
          ? `Tweet list (1-based ids):\n\n${numbered}`
          : `推文列表（编号 1-based）：\n\n${numbered}`,
      schema: TOPICS_SCHEMA,
      maxTokens: 3200,
    });

    const normalized = normalizeTopicsResult(result, tweets, lang);
    if (normalized.length > 0) return normalized;
  } catch (err) {
    console.error("[social-listening] topic extraction failed", err);
  }

  return buildFallbackTopics(tweets, lang);
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
