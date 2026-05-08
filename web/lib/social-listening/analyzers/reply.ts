/**
 * Reply drafter for tweets flagged action=reply_now.
 * Sonnet 4.6 — short output but tone matters, so we don't downsize to Haiku.
 *
 * Mirrors backend/analyzers/reply.py. Returns Markdown with 2 reply variants +
 * a one-line rationale.
 */
import {
  generateText,
  MODEL_SONNET,
} from "@/lib/social-listening/anthropic";
import type { Tweet, Lang } from "@/lib/social-listening/types";

export async function draftReply(
  tweet: Tweet,
  brandKeyword: string,
  lang: Lang = "zh"
): Promise<string> {
  const author = tweet.author_username || "user";
  const text = (tweet.text || "").trim();
  const sentiment = tweet.sentiment ?? "neutral";
  const category = tweet.category ?? "general";
  const urgency = tweet.urgency ?? "low";
  const summary = tweet.summary ?? "";
  const followers = tweet.author_followers ?? 0;
  const isZh = lang === "zh";

  const system = isZh
    ? `你是 ${brandKeyword} 团队的官方社媒回复助手。基于一条需要回复的 X/Twitter 推文，起草 2 条回复草稿（语气有差异：一条更专业克制，一条更温度/共情）。
要求：
- 用中文（如果原推文是英文，可用英文）
- 单条回复不超过 280 字符
- 真诚、不卑不亢，不回避问题
- 如果是 bug/投诉：先共情，再说明下一步动作
- 如果是功能建议：感谢 + 表态会带回团队 + 邀请补充细节
- 不要使用模板化的 'Thanks for your feedback' 等空话
- 严格输出 Markdown，结构如下：
**草稿 A · 简短直接**
> 回复内容

**草稿 B · 共情详细**
> 回复内容

**为什么这样回**：一句话说明意图`
    : `You are the ${brandKeyword} team's social media reply drafter. Given one X/Twitter tweet that needs a response, draft 2 reply variants (different tone — one concise/professional, one warmer/empathetic).
Rules:
- Match the original tweet's language
- Each reply ≤ 280 chars
- Honest, not defensive
- For bugs/complaints: empathy first, then concrete next step
- For feature requests: thanks + commit to bring it back + invite details
- No template phrases like 'Thanks for your feedback'
- Output strictly in Markdown:
**Draft A · Concise**
> reply

**Draft B · Empathetic**
> reply

**Why this works**: one-line rationale`;

  const user = isZh
    ? `原推文（@${author}，${followers} 粉，情感 ${sentiment}，类别 ${category}，紧急度 ${urgency}）：
"${text}"

AI 摘要：${summary || "（无）"}`
    : `Original tweet (@${author}, ${followers} followers, sentiment ${sentiment}, category ${category}, urgency ${urgency}):
"${text}"

AI summary: ${summary || "(none)"}`;

  return generateText({
    model: MODEL_SONNET,
    system,
    user,
    maxTokens: 900,
  });
}
