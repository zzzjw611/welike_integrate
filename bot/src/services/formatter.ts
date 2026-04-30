import type { DailyContent } from '../../../shared/types/index.js';
import type { Lang } from '../../../shared/types/index.js';
import { config } from '../config.js';

const MAX_CHARS = 4096;

const SECTION_META: Record<string, { en: string; zh: string; emoji: string }> = {
  daily_brief:    { en: 'Daily Brief',     zh: '每日要闻',  emoji: '📰' },
  growth_insight: { en: 'Growth Insight',  zh: '增长洞察',  emoji: '📈' },
  launch_radar:   { en: 'Launch Radar',    zh: '发布雷达',  emoji: '🚀' },
  daily_case:     { en: 'Daily Case',      zh: '案例拆解',  emoji: '🔍' },
};

function esc(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function formatDailyMessage(content: DailyContent, lang: Lang): string[] {
  const date = content.date;
  const dateLabel = new Date(date).toLocaleDateString(
    lang === 'zh' ? 'zh-CN' : 'en-GB',
    { year: 'numeric', month: 'long', day: 'numeric' }
  );

  const header = lang === 'zh'
    ? `📡 <b>AI Marketer Daily</b> · ${esc(dateLabel)}\n\n`
    : `📡 <b>AI Marketer Daily</b> · ${esc(dateLabel)}\n\n`;

  const sections = ['daily_brief', 'growth_insight', 'launch_radar', 'daily_case'] as const;
  const chunks: string[] = [];
  let current = header;

  for (const sectionKey of sections) {
    const articles = content[sectionKey];
    if (!articles.length && sectionKey !== 'growth_insight') continue;

    const meta = SECTION_META[sectionKey];
    let block = `${meta.emoji} <b>${esc(lang === 'zh' ? meta.zh : meta.en)}</b>\n`;

    if (!articles.length && sectionKey === 'growth_insight') {
      block += lang === 'zh' ? '今日休刊。\n' : 'Day off.\n';
    } else {
      for (const a of articles) {
        const title   = lang === 'zh' ? a.title_zh   : a.title_en;
        const summary = (lang === 'zh' ? a.content_zh : a.content_en).slice(0, 120);
        block += `• <b>${esc(title)}</b>\n${esc(summary)}…\n`;
      }
    }

    block += `\n<a href="${config.webBaseUrl}/archive/${date}?lang=${lang}">详情 → Dashboard</a>\n\n`;

    // Split into chunks if needed
    if ((current + block).length > MAX_CHARS) {
      chunks.push(current.trim());
      current = block;
    } else {
      current += block;
    }
  }

  if (current.trim()) chunks.push(current.trim());
  return chunks;
}
