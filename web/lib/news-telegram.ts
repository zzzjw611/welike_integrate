// Shared Telegram message formatter for AI Marketer News.
// Used by both CreateAlerts (manual "Send now") and the hourly cron dispatcher
// at /api/cron/dispatch-alerts.

import type { Issue, Lang } from "@/lib/ai-marketer-news";
import { pickLang } from "@/lib/ai-marketer-news";

export interface AlertSections {
  briefs: boolean;
  launches: boolean;
  growth_insights: boolean;
  daily_case: boolean;
}

const PUBLIC_BASE_URL =
  process.env.WEB_BASE_URL ||
  process.env.NEXT_PUBLIC_BASE_URL ||
  "https://welike-integrate.vercel.app";

const HEADERS = {
  en: {
    title: "AI Marketer News",
    daily_brief: "📋 Daily Brief",
    launch_radar: "🚀 Launch Radar",
    growth_insights: "💡 Growth Insights",
    daily_case: "📊 Daily Case",
    read_full: "📖 Read full issue →",
  },
  zh: {
    title: "AI Marketer News",
    daily_brief: "📋 每日要闻",
    launch_radar: "🚀 发布雷达",
    growth_insights: "💡 增长洞察",
    daily_case: "📊 案例拆解",
    read_full: "📖 阅读完整日报 →",
  },
} as const;

export function formatIssueForTelegram(
  issue: Pick<
    Issue,
    "date" | "briefs" | "launches" | "growth_insights" | "daily_case"
  >,
  sections: AlertSections,
  lang: Lang = "en"
): string {
  const h = HEADERS[lang];
  let text = `🤖 <b>${h.title} — ${issue.date}</b>\n\n`;

  if (sections.briefs && issue.briefs.length > 0) {
    text += `<b>${h.daily_brief}</b>\n`;
    issue.briefs.slice(0, 5).forEach((b) => {
      const title = pickLang(b.title, b.title_zh, lang);
      const summary = pickLang(b.summary, b.summary_zh, lang);
      text += `• <b>${title}</b>\n  ${summary.slice(0, 120)}${summary.length > 120 ? "…" : ""}\n`;
    });
    text += "\n";
  }

  if (sections.launches && issue.launches.length > 0) {
    text += `<b>${h.launch_radar}</b>\n`;
    issue.launches.slice(0, 3).forEach((l) => {
      const summary = pickLang(l.summary, l.summary_zh, lang);
      text += `• ${l.product} (${l.company})\n  ${summary.slice(0, 100)}${summary.length > 100 ? "…" : ""}\n`;
    });
    text += "\n";
  }

  if (sections.growth_insights && issue.growth_insights.length > 0) {
    text += `<b>${h.growth_insights}</b>\n`;
    issue.growth_insights.slice(0, 2).forEach((g) => {
      const quote = pickLang(g.quote, g.quote_zh, lang);
      text += `• "${quote.slice(0, 100)}${quote.length > 100 ? "…" : ""}" — ${g.author}\n`;
    });
    text += "\n";
  }

  if (sections.daily_case && issue.daily_case && issue.daily_case.company) {
    const caseTitle = pickLang(
      issue.daily_case.title,
      issue.daily_case.title_zh,
      lang
    );
    text += `<b>${h.daily_case}</b>\n`;
    text += `• ${issue.daily_case.company} — ${caseTitle}\n`;
  }

  text += `\n<a href="${PUBLIC_BASE_URL}/tools/news?lang=${lang}">${h.read_full}</a>`;
  return text;
}

// Direct Telegram sendMessage wrapper. Reads token from env so the bot token
// doesn't leak into client bundles.
export async function sendTelegramMessage(
  chatId: string | number,
  text: string
): Promise<{ ok: boolean; error?: string }> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    return { ok: false, error: "TELEGRAM_BOT_TOKEN not configured" };
  }
  try {
    const res = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: String(chatId),
          text,
          parse_mode: "HTML",
          disable_web_page_preview: true,
        }),
      }
    );
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      return { ok: false, error: `Telegram ${res.status}: ${body}` };
    }
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}
