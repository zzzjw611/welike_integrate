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
} from "@/lib/social-listening/types";

function fmtTweets(rows: Tweet[]): string {
  if (rows.length === 0) return "暂无";
  return rows
    .map(
      (t) =>
        `- @${t.author_username} (${t.author_followers ?? 0} 粉, 互动 ${t.engagement ?? 0}): "${(t.text || "").slice(0, 140)}"`
    )
    .join("\n");
}

export async function generateReport(
  keyword: string,
  tweets: Tweet[],
  topics: Topic[],
  sentimentCounts: SentimentCounts
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
              `- ${t.topic} (推文 ${t.count}, 情感 ${t.sentiment}, 紧急度 ${t.urgency}, 建议: ${t.action})`
          )
          .join("\n")
      : "暂无";

  const total =
    sentimentCounts.positive +
      sentimentCounts.negative +
      sentimentCounts.neutral || 1;
  const posPct = Math.round((sentimentCounts.positive / total) * 100);
  const negPct = Math.round((sentimentCounts.negative / total) * 100);
  const neuPct = Math.max(0, 100 - posPct - negPct);

  const system = `你是一位专业的数字营销社交聆听顾问。请基于给定的 X 平台社交聆听数据，生成一份中文 Markdown 格式的市场应对策略报告。

报告必须：
- 语言专业、具体、可执行，避免空话
- 结构严格按照用户要求
- 每条建议都要落到具体行动（谁做、做什么、什么时间）
- 使用 Markdown 格式化（## 二级标题、- 列表、**加粗** 关键词）`;

  const user = `## 数据摘要
- 监测关键词：${keyword}
- 分析推文数：${tweets.length} 条（按互动量排序后的高热度样本）
- 情感分布：积极 ${posPct}% / 消极 ${negPct}% / 中性 ${neuPct}%

## 积极讨论示例
${fmtTweets(pos)}

## 消极讨论示例
${fmtTweets(neg)}

## Bug / 问题投诉
${fmtTweets(bugs)}

## 功能建议
${fmtTweets(reqs)}

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
(近 1 周 / 近 1 月)`;

  return generateText({
    model: MODEL_SONNET,
    system,
    user,
    maxTokens: 4000,
  });
}
