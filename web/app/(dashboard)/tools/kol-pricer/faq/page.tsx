"use client";

import { useState } from "react";
import { useLang } from "@/lib/use-lang";

const FAQS_EN = [
  {
    q: "What data do you use to calculate the price?",
    a: "We use the KOL's follower count, recent tweet engagement (likes, replies, retweets, quotes, bookmarks), tweet impressions, posting frequency, and bio content — all fetched in real-time from the X API v2.",
  },
  {
    q: "How is the domain detected?",
    a: "We send the user's bio and recent tweet texts to Claude AI, which classifies them into one of 7 domains: crypto, AI, finance, business, tech, entertainment, or other — each with its own subcategory and pricing multiplier.",
  },
  {
    q: "Why does domain matter for pricing?",
    a: "Different niches have different advertiser demand and CPMs. Crypto, AI and finance KOLs typically command higher rates due to higher-value audiences, while entertainment is more mainstream and competitively priced.",
  },
  {
    q: "What is the engagement rate (ER)?",
    a: "Weighted ER = average weighted engagement (likes×1 + replies×3 + retweets×2 + quotes×4 + bookmarks×2) per tweet ÷ follower count × 100%. A higher weighted ER indicates a more engaged audience.",
  },
  {
    q: "What does the Coefficient of Variation (CV) measure?",
    a: "CV measures how consistent the KOL's metrics are. We blend posting-interval CV and impression CV (40/60). Lower combined CV = more predictable performance.",
  },
  {
    q: "How accurate is the pricing?",
    a: "The price is a data-driven estimate based on publicly available metrics. Actual rates may vary based on content requirements, exclusivity, campaign duration, and direct negotiation. Use the ±20% range as a starting point.",
  },
  {
    q: "Is there a rate limit?",
    a: "Yes, to protect API usage, each IP is limited to 5 analyses per minute. Please wait between requests if you hit the limit.",
  },
  {
    q: "What happens to my data?",
    a: "We don't store any data server-side. Analysis results are only kept in your browser session. Once you close the tab, the history is gone.",
  },
];

const FAQS_ZH = [
  {
    q: "你们用什么数据来计算价格？",
    a: "我们使用 KOL 的粉丝数、近期推文互动（点赞、回复、转发、引用、书签）、推文展示量、发布频率和简介内容 — 全部从 X API v2 实时获取。",
  },
  {
    q: "领域是如何检测的？",
    a: "我们将用户的简介和近期推文文本发送给 Claude AI，它会将其分类为 7 个领域之一：加密、AI、金融、商业、科技、娱乐或其他 — 每个领域都有自己的子类别和定价乘数。",
  },
  {
    q: "为什么领域对定价很重要？",
    a: "不同细分领域有不同的广告主需求和 CPM。加密、AI 和金融领域的 KOL 通常因受众价值更高而收费更高，而娱乐领域更为主流且竞争性定价。",
  },
  {
    q: "什么是互动率（ER）？",
    a: "加权 ER = 每条推文的平均加权互动（点赞×1 + 回复×3 + 转发×2 + 引用×4 + 书签×2）÷ 粉丝数 × 100%。加权 ER 越高表示受众参与度越高。",
  },
  {
    q: "变异系数（CV）衡量什么？",
    a: "CV 衡量 KOL 指标的一致性。我们综合发布间隔 CV 和展示量 CV（40/60）。综合 CV 越低 = 表现越可预测。",
  },
  {
    q: "定价有多准确？",
    a: "价格是基于公开指标的数据驱动估算。实际费率可能因内容要求、独家性、活动时长和直接谈判而有所不同。使用 ±20% 的范围作为起点。",
  },
  {
    q: "有频率限制吗？",
    a: "是的，为了保护 API 使用，每个 IP 每分钟限制 5 次分析。如果达到限制，请等待后再试。",
  },
  {
    q: "我的数据会怎样？",
    a: "我们不会在服务器端存储任何数据。分析结果仅保存在您的浏览器会话中。关闭标签页后，历史记录将消失。",
  },
];

export default function FAQPage() {
  const lang = useLang();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const faqs = lang === 'zh' ? FAQS_ZH : FAQS_EN;

  return (
    <div>
      <p className="text-base text-surface-400">
        {lang === 'zh' ? '关于 KOL 定价器你需要知道的一切。' : 'Everything you need to know about KOL Pricer.'}
      </p>

      <div className="mt-8 space-y-3">
        {faqs.map((faq, i) => (
          <div
            key={i}
            className="rounded-2xl border border-surface-800 bg-surface-900/50 transition-colors hover:border-surface-700"
          >
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="flex w-full items-center justify-between px-6 py-4 text-left"
            >
              <span className="pr-4 font-medium text-white">{faq.q}</span>
              <svg
                className={`h-5 w-5 shrink-0 text-surface-500 transition-transform ${
                  openIndex === i ? "rotate-180" : ""
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {openIndex === i && (
              <div className="border-t border-surface-800 px-6 py-4 text-sm leading-relaxed text-surface-400">
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
