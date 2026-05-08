/**
 * Follow-up Q&A grounded in the captured tweets + topics + report.
 * Sonnet 4.6 with prompt caching on the system evidence block — multi-turn
 * follow-ups reuse the cached prefix (~90% cheaper reads).
 *
 * Mirrors backend/analyzers/chat.py.
 */
import Anthropic from "@anthropic-ai/sdk";
import {
  getAnthropic,
  MODEL_SONNET,
} from "@/lib/social-listening/anthropic";
import type {
  Tweet,
  Topic,
  ChatTurn,
  Lang,
} from "@/lib/social-listening/types";

function buildEvidence(
  keyword: string,
  tweets: Tweet[],
  topics: Topic[],
  reportMarkdown: string,
  lang: Lang
): string {
  const sample = tweets.slice(0, 30);
  const evidence = sample
    .map(
      (t, i) =>
        `[推文${i + 1}] @${t.author_username} (情感:${t.sentiment ?? "?"}, 类别:${t.category ?? "?"}, 紧急度:${t.urgency ?? "?"}, 建议:${t.action ?? "?"}): ${(t.text || "").slice(0, 180)}`
    )
    .join("\n");
  const topicBlock = topics
    .map(
      (t) =>
        `- ${t.topic} (紧急度:${t.urgency ?? "?"}, 建议:${t.action ?? "?"}, 关联推文:${(t.tweet_ids || []).map((i) => `#${i}`).join(",")})`
    )
    .join("\n");

  // Stable rules block — language-aware so the assistant answers in the user's
  // current UI language. Keep otherwise byte-identical so cache hits.
  const rulesZh = `# 回答规则
- 只基于以上证据回答，不要编造
- 用中文回复，简洁专业，使用 Markdown
- 引用证据时用 [推文1] [推文3] 格式，用户可点击跳转
- 如果证据不足，明确说明"当前数据无法支撑此结论"
- 给出的建议要具体、可执行（谁做、做什么、什么时间）`;
  const rulesEn = `# Answer rules
- Only use the evidence above. Do not fabricate.
- Reply in English, concise and professional, in Markdown.
- Reference evidence with [Tweet 1] [Tweet 3] style — they're clickable.
- If evidence is insufficient, explicitly say "the current data cannot support this conclusion".
- Recommendations must be concrete and actionable (who, what, when).`;
  const rulesBlock = lang === "en" ? rulesEn : rulesZh;

  return `你是 WeLike 社交聆听的分析助手。用户监测的关键词是「${keyword}」。

# 已采集的推文证据（共 ${sample.length} 条，按编号引用）
${evidence}

# 已识别的话题
${topicBlock}

# 已生成的策略报告（完整）
${reportMarkdown}

${rulesBlock}`;
}

export async function answerFollowup(
  question: string,
  keyword: string,
  tweets: Tweet[],
  topics: Topic[],
  reportMarkdown: string,
  history: ChatTurn[] = [],
  lang: Lang = "zh"
): Promise<string> {
  const evidence = buildEvidence(keyword, tweets, topics, reportMarkdown, lang);

  // System as a list-of-blocks with cache_control on the evidence — frozen per
  // task, every follow-up question hits the cache.
  const systemBlocks: Anthropic.TextBlockParam[] = [
    {
      type: "text",
      text: evidence,
      cache_control: { type: "ephemeral" },
    },
  ];

  const messages: Anthropic.MessageParam[] = [];
  for (const h of history.slice(-8)) {
    if (
      (h.role === "user" || h.role === "assistant") &&
      typeof h.content === "string" &&
      h.content
    ) {
      messages.push({ role: h.role, content: h.content });
    }
  }
  messages.push({ role: "user", content: question });

  const client = getAnthropic();
  const response = await client.messages.create({
    model: MODEL_SONNET,
    max_tokens: 1500,
    system: systemBlocks,
    messages,
  });

  // Surface cache efficiency in server logs so we can tune.
  const usage = response.usage as
    | (typeof response.usage & {
        cache_read_input_tokens?: number;
        cache_creation_input_tokens?: number;
      })
    | undefined;
  if (usage?.cache_read_input_tokens) {
    // eslint-disable-next-line no-console
    console.log(
      `[chat] cache hit: read=${usage.cache_read_input_tokens} uncached_in=${usage.input_tokens} out=${usage.output_tokens}`
    );
  } else if (usage?.cache_creation_input_tokens) {
    // eslint-disable-next-line no-console
    console.log(
      `[chat] cache created: wrote=${usage.cache_creation_input_tokens} uncached_in=${usage.input_tokens} out=${usage.output_tokens}`
    );
  }

  const text = response.content
    .filter((c): c is Anthropic.TextBlock => c.type === "text")
    .map((c) => c.text)
    .join("\n")
    .trim();
  return text;
}
