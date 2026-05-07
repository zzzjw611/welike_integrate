// Shared Telegram message formatter for AI Marketer News.
// Used by both CreateAlerts (manual "Send now") and the hourly cron dispatcher
// at /api/cron/dispatch-alerts.

import type { Issue } from "@/lib/ai-marketer-news";

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

export function formatIssueForTelegram(
  issue: Pick<
    Issue,
    "date" | "briefs" | "launches" | "growth_insights" | "daily_case"
  >,
  sections: AlertSections
): string {
  let text = `🤖 <b>AI Marketer News — ${issue.date}</b>\n\n`;

  if (sections.briefs && issue.briefs.length > 0) {
    text += `<b>📋 Daily Brief</b>\n`;
    issue.briefs.slice(0, 5).forEach((b) => {
      text += `• <b>${b.title}</b>\n  ${b.summary.slice(0, 120)}${b.summary.length > 120 ? "…" : ""}\n`;
    });
    text += "\n";
  }

  if (sections.launches && issue.launches.length > 0) {
    text += `<b>🚀 Launch Radar</b>\n`;
    issue.launches.slice(0, 3).forEach((l) => {
      text += `• ${l.product} (${l.company})\n  ${l.summary.slice(0, 100)}${l.summary.length > 100 ? "…" : ""}\n`;
    });
    text += "\n";
  }

  if (sections.growth_insights && issue.growth_insights.length > 0) {
    text += `<b>💡 Growth Insights</b>\n`;
    issue.growth_insights.slice(0, 2).forEach((g) => {
      text += `• "${g.quote.slice(0, 100)}${g.quote.length > 100 ? "…" : ""}" — ${g.author}\n`;
    });
    text += "\n";
  }

  if (sections.daily_case && issue.daily_case && issue.daily_case.company) {
    text += `<b>📊 Daily Case</b>\n`;
    text += `• ${issue.daily_case.company} — ${issue.daily_case.title}\n`;
  }

  text += `\n📖 <a href="${PUBLIC_BASE_URL}/tools/news">Read full issue →</a>`;
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
