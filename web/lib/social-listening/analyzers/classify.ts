/**
 * Batch tweet classification — Claude Haiku 4.5.
 *
 * Mirrors backend/analyzers/classify.py: feeds 20-30 numbered tweets in one
 * call, gets back sentiment / sentiment_score / category / urgency / action /
 * summary for each.
 *
 * Uses our generic structured-output helper (forced tool_use) instead of
 * `messages.parse` so it's portable across @anthropic-ai/sdk versions.
 */
import {
  generateStructured,
  MODEL_HAIKU,
  type JsonSchema,
} from "@/lib/social-listening/anthropic";
import type {
  Tweet,
  ClassifierSentiment,
  Category,
  Urgency,
  Action,
  Lang,
} from "@/lib/social-listening/types";

interface RawClassification {
  id: number; // 1-based index back into the input array
  sentiment: ClassifierSentiment;
  sentiment_score: number;
  category: Category;
  urgency: Urgency;
  action: Action;
  summary: string;
  summary_zh: string;
  summary_en: string;
}

interface ClassificationBatchOutput {
  results?: RawClassification[] | Record<string, RawClassification>;
}

const CLASSIFY_SCHEMA: JsonSchema = {
  type: "object",
  properties: {
    results: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "integer", description: "推文编号，1-based" },
          sentiment: {
            type: "string",
            enum: ["positive", "negative", "neutral"],
          },
          sentiment_score: {
            type: "number",
            minimum: 0,
            maximum: 1,
            description: "情感强度 0-1",
          },
          category: {
            type: "string",
            enum: [
              "key_voice",
              "feature_request",
              "bug_issue",
              "competitor",
              "general",
            ],
          },
          urgency: { type: "string", enum: ["high", "medium", "low"] },
          action: {
            type: "string",
            enum: [
              "reply_now",
              "log_product",
              "monitor",
              "share_amplify",
              "ignore",
            ],
          },
          summary: {
            type: "string",
            maxLength: 150,
            description: "One-sentence summary in the requested UI language.",
          },
          summary_zh: {
            type: "string",
            maxLength: 150,
            description: "中文一句话概括；产品名、人名和平台名可保留英文。",
          },
          summary_en: {
            type: "string",
            maxLength: 150,
            description: "One-sentence English summary; keep proper nouns unchanged.",
          },
        },
        required: [
          "id",
          "sentiment",
          "sentiment_score",
          "category",
          "urgency",
          "action",
          "summary",
          "summary_zh",
          "summary_en",
        ],
      },
    },
  },
  required: ["results"],
};

const RULES_ZH = `分类规则：
- key_voice：高粉丝（>10000）或高互动（>100）账号的重要声音
- feature_request：含 "should have" / "would love" / "希望" / "建议" / "feature"
- bug_issue：含 bug / broken / not working / 崩溃 / 不工作
- competitor：提到其他产品做对比
- general：一般讨论

紧急度规则：
- high：消极情绪 + 高粉丝账号，或明确的 bug/投诉（需 24h 内处理）
- medium：普通功能建议或中等影响 (1 周内)
- low：一般讨论

推荐动作：
- reply_now：立即回复（消极+高影响，或明确投诉）
- log_product：记录到产品后台（功能建议、bug）
- monitor：监控跟踪（一般讨论）
- share_amplify：扩散转发（积极高影响力内容）
- ignore：忽略（低价值内容）`;

const RULES_EN = `Classification rules:
- key_voice: high-follower (>10000) or high-engagement (>100) accounts with important signals
- feature_request: contains "should have" / "would love" / "hope" / "suggest" / "feature"
- bug_issue: contains bug / broken / not working / crash / failure complaints
- competitor: compares against another product
- general: general discussion

Urgency rules:
- high: negative sentiment + high-impact account, or explicit bug/complaint that needs a response within 24h
- medium: normal feature requests or medium-impact issues within 1 week
- low: general discussion

Recommended actions:
- reply_now: reply immediately for negative high-impact posts or direct complaints
- log_product: log in the product backlog for feature requests or bugs
- monitor: keep watching the discussion
- share_amplify: amplify positive high-impact content
- ignore: ignore low-value content`;

function systemPrompt(lang: Lang): string {
  if (lang === "en") {
    return `You are a senior social listening analyst. Analyze every tweet across sentiment, urgency, category, recommended action, and summary.

Return both summary_zh and summary_en for every tweet. Set summary to the English summary. Keep product names and proper nouns such as Gemini, ChatGPT, OpenAI, Claude, X, and Perplexity unchanged.

${RULES_EN}`;
  }

  return `你是一位资深的社交聆听分析师。请对每一条推文做多维度分析。

请为每条推文同时输出 summary_zh 和 summary_en。summary 字段使用中文。中文里产品名、平台名、人名等专有名词可以保留英文，例如 Gemini、ChatGPT、OpenAI、Claude、X、Perplexity。

${RULES_ZH}`;
}

function normalizeClassificationOutputs(
  input: ClassificationBatchOutput | RawClassification[] | unknown
): RawClassification[] {
  if (Array.isArray(input)) return input as RawClassification[];
  if (!input || typeof input !== "object") return [];
  const maybeResults = (input as ClassificationBatchOutput).results;
  if (Array.isArray(maybeResults)) return maybeResults;
  if (maybeResults && typeof maybeResults === "object") {
    return Object.values(maybeResults);
  }
  return [];
}

/**
 * Enrich each input tweet in-place with classification fields. Returns the
 * same array reference for chainable use. Empty input is a no-op.
 */
export async function classifyTweets(
  tweets: Tweet[],
  lang: Lang = "zh"
): Promise<Tweet[]> {
  if (tweets.length === 0) return tweets;

  const lines = tweets
    .map(
      (t, i) =>
        `${i + 1}. [@${t.author_username} followers=${t.author_followers ?? 0} engagement=${t.engagement ?? 0}] ${t.text.slice(0, 240)}`
    )
    .join("\n");

  const user =
    lang === "en"
      ? `Analyze the following ${tweets.length} tweets:\n\n${lines}`
      : `请分析以下 ${tweets.length} 条推文：\n\n${lines}`;

  // 30 tweets × ~120 output tokens ≈ 3600; pad to 5000 for safety (matches Python).
  const parsed = await generateStructured<ClassificationBatchOutput>({
    model: MODEL_HAIKU,
    system: systemPrompt(lang),
    user,
    schema: CLASSIFY_SCHEMA,
    maxTokens: 5000,
  });

  const fillDefault = (t: Tweet) => {
    if (!t.sentiment) t.sentiment = "neutral";
    if (t.sentiment_score === undefined) t.sentiment_score = 0.5;
    if (!t.category) t.category = "general";
    if (!t.urgency) t.urgency = "low";
    if (!t.action) t.action = "monitor";
    if (t.summary === undefined) t.summary = "";
    if (t.summary_zh === undefined) t.summary_zh = t.summary || "";
    if (t.summary_en === undefined) t.summary_en = t.summary || "";
  };

  if (!parsed) {
    for (const t of tweets) fillDefault(t);
    return tweets;
  }

  const byId = new Map<number, RawClassification>();
  for (const r of normalizeClassificationOutputs(parsed)) {
    const id = Number(r?.id);
    if (Number.isFinite(id)) byId.set(id, r);
  }

  for (let i = 0; i < tweets.length; i++) {
    const tweet = tweets[i];
    const info = byId.get(i + 1);
    if (info) {
      tweet.sentiment = info.sentiment;
      tweet.sentiment_score = info.sentiment_score;
      tweet.category = info.category;
      tweet.urgency = info.urgency;
      tweet.action = info.action;
      tweet.summary_zh = info.summary_zh || info.summary;
      tweet.summary_en = info.summary_en || info.summary;
      tweet.summary =
        lang === "en" ? tweet.summary_en || info.summary : tweet.summary_zh || info.summary;
    } else {
      fillDefault(tweet);
    }

    // Heuristic override: high-follower accounts default to key_voice when
    // the model labelled them generic.
    if (
      (tweet.author_followers ?? 0) > 10000 &&
      tweet.category === "general"
    ) {
      tweet.category = "key_voice";
    }
  }

  return tweets;
}
