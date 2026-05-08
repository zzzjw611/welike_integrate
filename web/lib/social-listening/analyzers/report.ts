/**
 * Market strategy report generator — Claude Sonnet 4.6.
 *
 * Mirrors backend/analyzers/report.py. Single non-streaming call (Vercel
 * serverless invocations don't benefit from streaming since we render the
 * markdown after the whole task completes).
 */
import {
  generateText,
  MODEL_SONNET,
} from "@/lib/social-listening/anthropic";
import type {
  Tweet,
  Topic,
  SentimentCounts,
  Lang,
} from "@/lib/social-listening/types";

function fmtTweets(rows: Tweet[], lang: Lang): string {
  if (rows.length === 0) return lang === "zh" ? "暂无" : "None";
  return rows
    .map(
      (t) =>
        lang === "zh"
          ? `- @${t.author_username} (${t.author_followers ?? 0} 粉, 互动 ${t.engagement ?? 0}): "${(t.text || "").slice(0, 140)}"`
          : `- @${t.author_username} (${t.author_followers ?? 0} followers, engagement ${t.engagement ?? 0}): "${(t.text || "").slice(0, 140)}"`
    )
    .join("\n");
}

function localizedTopic(topic: Topic, lang: Lang): string {
  return lang === "zh"
    ? topic.topic_zh || topic.topic
    : topic.topic_en || topic.topic;
}

function localizedAction(topic: Topic, lang: Lang): string {
  return lang === "zh"
    ? topic.action_zh || topic.action
    : topic.action_en || topic.action;
}

export async function generateReport(
  keyword: string,
  tweets: Tweet[],
  topics: Topic[],
  sentimentCounts: SentimentCounts,
  lang: Lang = "zh"
): Promise<string> {
  const pos = tweets.filter((t) => t.sentiment === "positive").slice(0, 3);
  const neg = tweets.filter((t) => t.sentiment === "negative").slice(0, 3);
  const bugs = tweets.filter((t) => t.category === "bug_issue").slice(0, 3);
  const reqs = tweets
    .filter((t) => t.category === "feature_request")
    .slice(0, 3);

  const topicList =
    topics.length > 0
      ? topics
          .map(
            (t) =>
              lang === "zh"
                ? `- ${localizedTopic(t, lang)} (推文 ${t.count}, 情感 ${t.sentiment}, 紧急度 ${t.urgency}, 建议: ${localizedAction(t, lang)})`
                : `- ${localizedTopic(t, lang)} (tweets ${t.count}, sentiment ${t.sentiment}, urgency ${t.urgency}, advice: ${localizedAction(t, lang)})`
          )
          .join("\n")
      : lang === "zh" ? "暂无" : "None";

  const total =
    sentimentCounts.positive +
      sentimentCounts.negative +
      sentimentCounts.neutral || 1;
  const posPct = Math.round((sentimentCounts.positive / total) * 100);
  const negPct = Math.round((sentimentCounts.negative / total) * 100);
  const neuPct = Math.max(0, 100 - posPct - negPct);

  const system =
    lang === "zh"
      ? `你是一位专业的数字营销社交聆听顾问。请基于给定的 X 平台社交聆听数据，生成一份中文 Markdown 格式的市场应对策略报告。

报告必须：
- 语言专业、具体、可执行，避免空话
- 结构严格按照用户要求
- 每条建议都要落到具体行动（谁做、做什么、什么时间）
- 使用 Markdown 格式化（## 二级标题、- 列表、**加粗** 关键词）
- 产品名、平台名、人名等专有名词可保留英文`
      : `You are a professional digital marketing and social listening consultant. Based on the provided X social listening data, generate an English Markdown market response strategy report.

The report must:
- Be professional, specific, and actionable
- Follow the requested structure exactly
- Tie every recommendation to concrete action: owner, action, and timing
- Use Markdown formatting (## second-level headings, - lists, **bold** keywords)
- Keep product names, platform names, and proper nouns unchanged`;

  const user =
    lang === "zh"
      ? `## 数据摘要
- 监测关键词：${keyword}
- 分析推文数：${tweets.length} 条（按互动量排序后的高热度样本）
- 情感分布：积极 ${posPct}% / 消极 ${negPct}% / 中性 ${neuPct}%

## 积极讨论示例
${fmtTweets(pos, lang)}

## 消极讨论示例
${fmtTweets(neg, lang)}

## Bug / 问题投诉
${fmtTweets(bugs, lang)}

## 功能建议
${fmtTweets(reqs, lang)}

## 热点话题
${topicList}

---

请严格按以下结构输出完整报告：

# 📊 WeLike 社交聆听与市场策略报告
## 监测对象：${keyword}

## 一、社交聆听概览
(整体情绪倾向、讨论热度、核心话题)

## 二、积极讨论与品牌优势
(用户认可点、可放大扩散的声音)

## 三、风险与负面信号
(消极话题、Bug 报告、潜在危机)

## 四、热点话题深度分析
(逐一分析 top 话题的成因、影响、建议行动)

## 五、市场应对策略建议（按优先级）
(5-8 条具体、可执行的营销、公关、产品建议)

## 六、行动计划时间表
(近 1 周 / 近 1 月)`
      : `## Data summary
- Monitored keyword: ${keyword}
- Tweets analyzed: ${tweets.length} high-engagement samples
- Sentiment distribution: positive ${posPct}% / negative ${negPct}% / neutral ${neuPct}%

## Positive discussion examples
${fmtTweets(pos, lang)}

## Negative discussion examples
${fmtTweets(neg, lang)}

## Bugs / complaints
${fmtTweets(bugs, lang)}

## Feature requests
${fmtTweets(reqs, lang)}

## Hot topics
${topicList}

---

Please output the full report exactly in this structure:

# 📊 WeLike Social Listening & Market Strategy Report
## Monitored Object: ${keyword}

## 1. Social Listening Overview
(overall sentiment, discussion heat, core topics)

## 2. Positive Discussion & Brand Strengths
(recognized strengths and voices worth amplifying)

## 3. Risks & Negative Signals
(negative topics, bug reports, potential crises)

## 4. Hot Topic Deep Dive
(analyze each top topic's cause, impact, and recommended action)

## 5. Market Response Recommendations by Priority
(5-8 concrete, executable marketing, PR, and product recommendations)

## 6. Action Timeline
(next 1 week / next 1 month)`;

  return generateText({
    model: MODEL_SONNET,
    system,
    user,
    maxTokens: 4000,
  });
}
