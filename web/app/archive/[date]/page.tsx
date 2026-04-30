import { Suspense } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getDailyContent, getMostRecentDate } from '@/lib/db';
import { getCache, setCache, dailyKey, CACHE_TTL } from '@/lib/redis';
import { parseLangParam, UI_STRINGS } from '@/lib/i18n';
import DailyBrief    from '@/components/DailyBrief';
import GrowthInsight from '@/components/GrowthInsight';
import LaunchRadar   from '@/components/LaunchRadar';
import DailyCase     from '@/components/DailyCase';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import type { Lang, DailyContent } from '@/lib/types';

interface Props {
  params: { date: string };
  searchParams: { lang?: string };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function isValidDate(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(Date.parse(s));
}

function offsetDate(date: string, days: number): string {
  const d = new Date(date + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function formatDate(date: string, lang: Lang): string {
  return new Date(date + 'T00:00:00Z').toLocaleDateString(
    lang === 'zh' ? 'zh-CN' : 'en-GB',
    { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' },
  );
}

function hasAnyContent(c: DailyContent): boolean {
  return !!(c.daily_brief.length || c.growth_insight.length || c.launch_radar.length || c.daily_case.length);
}

// ── Metadata ──────────────────────────────────────────────────────────────────

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { date } = params;
  if (!isValidDate(date)) return { title: 'Not Found' };
  const lang: Lang = parseLangParam(searchParams.lang) ?? 'en';
  const dateStr = formatDate(date, lang);
  return {
    title:       `AI Marketer Daily — ${dateStr}`,
    description: `AI marketing intelligence digest for ${date}.`,
    openGraph: {
      title:       `AI Marketer Daily — ${dateStr}`,
      description: 'Daily AI marketing intelligence: news, growth insights, product launches, and case studies.',
      type:        'website',
    },
    twitter: {
      card:        'summary',
      title:       `AI Marketer Daily — ${dateStr}`,
      description: 'Daily AI marketing intelligence. 8 minutes a day.',
    },
  };
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function ArchiveDatePage({ params, searchParams }: Props) {
  const { date } = params;

  if (!isValidDate(date)) notFound();

  const lang: Lang = parseLangParam(searchParams.lang) ?? 'en';
  const s          = UI_STRINGS[lang];
  const today      = new Date().toISOString().slice(0, 10);

  // Fetch with long-TTL cache — historical content never changes
  let content: DailyContent = { date, daily_brief: [], growth_insight: [], launch_radar: [], daily_case: [] };
  let dbError   = false;
  let recentDate: string | null = null;

  try {
    const cacheKey = dailyKey(date);
    const cached   = await getCache<DailyContent>(cacheKey);
    if (cached) {
      content = cached;
    } else {
      content = await getDailyContent(date);
      if (hasAnyContent(content)) await setCache(cacheKey, content, CACHE_TTL.archive);
    }
    if (!hasAnyContent(content)) recentDate = await getMostRecentDate();
  } catch (err) {
    console.error('[ArchiveDatePage] DB/Redis error:', err);
    dbError = true;
  }

  const prevDate = offsetDate(date, -1);
  const nextDate = offsetDate(date, +1);
  const isFuture = nextDate > today;

  return (
    <div className="min-h-screen bg-surface-950 text-surface-100">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="border-b border-surface-800 sticky top-0 z-50 bg-surface-950/95 backdrop-blur-sm">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <Link href={`/?lang=${lang}`} className="text-sm font-bold tracking-tight text-white">
            AI Marketer Daily
          </Link>
          <div className="flex items-center gap-4 shrink-0">
            <Link
              href={`/archive?lang=${lang}`}
              className="text-xs text-surface-500 hover:text-white transition-colors"
            >
              {lang === 'zh' ? '↑ 归档' : '↑ Archive'}
            </Link>
            <Suspense fallback={null}>
              <LanguageSwitcher current={lang} />
            </Suspense>
          </div>
        </div>
      </header>

      {/* ── Date bar ───────────────────────────────────────────────────── */}
      <div className="border-b border-surface-800/50 bg-surface-900/30">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 py-2 flex items-center justify-between">
          <time dateTime={date} className="text-[11px] font-medium text-surface-400 tracking-wide">
            {formatDate(date, lang)}
          </time>
          {hasAnyContent(content) && (
            <span className="text-[11px] text-surface-600">{s.min_read}</span>
          )}
        </div>
      </div>

      {/* ── Main content ───────────────────────────────────────────────── */}
      <main className="mx-auto max-w-2xl px-4 sm:px-6">
        {dbError ? (
          <div className="py-20 text-center">
            <p className="text-surface-600 text-sm">
              {lang === 'zh' ? '内容加载失败，请稍后重试。' : 'Failed to load content. Please try again later.'}
            </p>
          </div>
        ) : !hasAnyContent(content) ? (
          <div className="py-20 text-center space-y-4">
            <p className="text-surface-500 text-sm">
              {lang === 'zh' ? '该日无内容。' : 'No content published for this date.'}
            </p>
            {recentDate && (
              <Link
                href={`/archive/${recentDate}?lang=${lang}`}
                className="inline-flex items-center gap-1.5 text-sm text-brand-500 hover:text-brand-400 transition-colors"
              >
                {lang === 'zh'
                  ? `跳转到最近发布内容：${recentDate}`
                  : `Jump to most recent issue: ${recentDate}`}
                {' →'}
              </Link>
            )}
          </div>
        ) : (
          <div className="divide-y divide-surface-800">
            <section className="py-8">
              <DailyBrief articles={content.daily_brief} lang={lang} />
            </section>
            <section className="py-8">
              <GrowthInsight articles={content.growth_insight} lang={lang} />
            </section>
            <section className="py-8">
              <LaunchRadar articles={content.launch_radar} lang={lang} />
            </section>
            <section className="py-8">
              <DailyCase article={content.daily_case[0] ?? null} lang={lang} />
            </section>
          </div>
        )}
      </main>

      {/* ── Date navigation ────────────────────────────────────────────── */}
      <nav
        aria-label={lang === 'zh' ? '日期导航' : 'Date navigation'}
        className="border-t border-surface-800 mt-4"
      >
        <div className="mx-auto max-w-2xl px-4 sm:px-6 py-5 flex items-center justify-between">
          <Link
            href={`/archive/${prevDate}?lang=${lang}`}
            className="group flex items-center gap-2 text-sm text-surface-500 hover:text-white transition-colors"
          >
            <span className="group-hover:-translate-x-0.5 transition-transform">←</span>
            <span>{s.prev_day}</span>
          </Link>

          {!isFuture && (
            <Link
              href={`/archive/${nextDate}?lang=${lang}`}
              className="group flex items-center gap-2 text-sm text-surface-500 hover:text-white transition-colors"
            >
              <span>{s.next_day}</span>
              <span className="group-hover:translate-x-0.5 transition-transform">→</span>
            </Link>
          )}
        </div>
      </nav>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer className="border-t border-surface-800">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-surface-600">
          <span>© {new Date().getFullYear()} AI Marketer Daily by JE Labs</span>
          <span>{lang === 'zh' ? '仅供内部使用' : 'Internal use only'}</span>
        </div>
      </footer>

    </div>
  );
}
