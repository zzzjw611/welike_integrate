import type { Lang } from '@/lib/types';

export type { Lang };

export function detectLang(acceptLanguage?: string | null): Lang {
  if (!acceptLanguage) return 'en';
  // Use includes to catch "en-US,zh-CN;q=0.9" style headers
  return acceptLanguage.toLowerCase().includes('zh') ? 'zh' : 'en';
}

export function parseLangParam(param?: string | string[] | null): Lang | null {
  const val = Array.isArray(param) ? param[0] : param;
  if (val === 'zh' || val === 'en') return val;
  return null;
}

// PRD-specified emojis (PRD 4.2)
export const SECTION_LABELS: Record<string, { en: string; zh: string; emoji: string }> = {
  daily_brief:    { en: 'Daily Brief',    zh: '每日要闻', emoji: '📅' },
  growth_insight: { en: 'Growth Insight', zh: '增长洞察', emoji: '💡' },
  launch_radar:   { en: 'Launch Radar',   zh: '发布雷达', emoji: '🚀' },
  daily_case:     { en: 'Daily Case',     zh: '案例拆解', emoji: '📚' },
};

export const UI_STRINGS = {
  en: {
    slogan:      'The daily intelligence brief for AI marketers worldwide. 8 minutes a day. Free forever.',
    prev_day:    'Previous day',
    next_day:    'Next day',
    min_read:    '8 min read',
    no_content:  'No content published for this date.',
    off_day:     'Day off — back tomorrow.',
  },
  zh: {
    slogan:      '面向全球 AI 营销人的每日情报简报。每天 8 分钟，永久免费。',
    prev_day:    '前一天',
    next_day:    '后一天',
    min_read:    '8 分钟阅读',
    no_content:  '该日期暂无发布内容。',
    off_day:     '今日休刊，明天见。',
  },
} as const;
