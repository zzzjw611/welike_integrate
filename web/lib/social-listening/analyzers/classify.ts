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
} from "@/lib/social-listening/types";

interface RawClassification {
  id: number; // 1-based index back into the input array
  sentiment: ClassifierSentiment;
  sentiment_score: number;
  category: Category;
  urgency: Urgency;
  action: Action;
  summary: string;
}

interface ClassificationBatchOutput {
  results: RawClassification[];
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
            description: "中文一句话概括",
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
        ],
      },
    },
  },
  required: ["results"],
};

const SYSTEM = `你是一位资深的社交聆听分析师。请对每一条推文做多维度分析。

分类规则：
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

/**
 * Enrich each input tweet in-place with classification fields. Returns the
 * same array reference for chainable use. Empty input is a no-op.
 */
export async function classifyTweets(tweets: Tweet[]): Promise<Tweet[]> {
  if (tweets.length === 0) return tweets;

  const lines = tweets
    .map(
      (t, i) =>
        `${i + 1}. [@${t.author_username} followers=${t.author_followers ?? 0} engagement=${t.engagement ?? 0}] ${t.text.slice(0, 240)}`
    )
    .join("\n");

  const user = `请分析以下 ${tweets.length} 条推文：\n\n${lines}`;

  // 30 tweets × ~120 output tokens ≈ 3600; pad to 5000 for safety (matches Python).
  const parsed = await generateStructured<ClassificationBatchOutput>({
    model: MODEL_HAIKU,
    system: SYSTEM,
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
  };

  if (!parsed) {
    for (const t of tweets) fillDefault(t);
    return tweets;
  }

  const byId = new Map<number, RawClassification>();
  for (const r of parsed.results) byId.set(r.id, r);

  for (let i = 0; i < tweets.length; i++) {
    const tweet = tweets[i];
    const info = byId.get(i + 1);
    if (info) {
      tweet.sentiment = info.sentiment;
      tweet.sentiment_score = info.sentiment_score;
      tweet.category = info.category;
      tweet.urgency = info.urgency;
      tweet.action = info.action;
      tweet.summary = info.summary;
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
