import { Suspense } from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getPublishedDates } from '@/lib/db';
import { getCache, setCache } from '@/lib/redis';
import { parseLangParam } from '@/lib/i18n';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import type { Lang } from '@/lib/types';

interface Props {
  searchParams: { lang?: string };
}

const INDEX_CACHE_KEY = 'archive:index';
const INDEX_CACHE_TTL = 3600; // 1 h — revalidates after new content is published

function formatMonthHeading(yearMonth: string, lang: Lang): string {
  return new Date(yearMonth + '-01T00:00:00Z').toLocaleDateString(
    lang === 'zh' ? 'zh-CN' : 'en-US',
    { year: 'numeric', month: 'long' },
  );
}

function formatDayLabel(date: string, lang: Lang): string {
  const d = new Date(date + 'T00:00:00Z');
  if (lang === 'zh') {
    return d.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'short' });
  }
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
}

// ── Metadata ──────────────────────────────────────────────────────────────────

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const lang: Lang = parseLangParam(searchParams.lang) ?? 'en';
  const title = lang === 'zh' ? 'AI Marketer Daily — 历史归档' : 'AI Marketer Daily — Archive';
  const description = lang === 'zh'
    ? '按日期浏览 AI Marketer Daily 历史内容'
    : 'Browse all past issues of AI Marketer Daily by date';
  return { title, description };
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function ArchiveIndexPage({ searchParams }: Props) {
  const lang: Lang = parseLangParam(searchParams.lang) ?? 'en';

  let dates: string[] = [];
  try {
    const cached = await getCache<string[]>(INDEX_CACHE_KEY);
    if (cached) {
      dates = cached;
    } else {
      dates = await getPublishedDates();
      if (dates.length) await setCache(INDEX_CACHE_KEY, dates, INDEX_CACHE_TTL);
    }
  } catch {
    // non-fatal — show empty state
  }

  // Group by YYYY-MM, sorted newest-first
  const byMonth = dates.reduce<Record<string, string[]>>((acc, date) => {
    const month = date.slice(0, 7);
    (acc[month] ??= []).push(date);
    return acc;
  }, {});
  const months = Object.keys(byMonth).sort((a, b) => b.localeCompare(a));

  return (
    <div className="min-h-screen bg-surface-950 text-surface-100">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="border-b border-surface-800 sticky top-0 z-50 bg-surface-950/95 backdrop-blur-sm">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <Link href={`/?lang=${lang}`} className="text-sm font-bold tracking-tight text-white">
            AI Marketer Daily
          </Link>
          <Suspense fallback={null}>
            <LanguageSwitcher current={lang} />
          </Suspense>
        </div>
      </header>

      {/* ── Main ───────────────────────────────────────────────────────── */}
      <main className="mx-auto max-w-2xl px-4 sm:px-6 py-10">

        {/* Page title */}
        <div className="mb-10">
          <h1 className="text-xl font-bold text-white mb-1">
            {lang === 'zh' ? '历史归档' : 'Archive'}
          </h1>
          <p className="text-sm text-surface-500">
            {dates.length === 0
              ? (lang === 'zh' ? '暂无已发布内容' : 'No published issues yet')
              : lang === 'zh'
                ? `共 ${dates.length} 期已发布`
                : `${dates.length} issue${dates.length !== 1 ? 's' : ''} published`}
          </p>
        </div>

        {months.length === 0 ? (
          <p className="py-20 text-center text-sm text-surface-600">
            {lang === 'zh' ? '暂无已发布内容。' : 'No published issues yet.'}
          </p>
        ) : (
          <div className="space-y-10">
            {months.map((month) => (
              <section key={month}>
                {/* Month heading */}
                <h2 className="text-xs font-bold uppercase tracking-widest text-brand-500 mb-4">
                  {formatMonthHeading(month, lang)}
                </h2>

                {/* Date list */}
                <div className="space-y-1.5">
                  {byMonth[month].map((date) => (
                    <Link
                      key={date}
                      href={`/archive/${date}?lang=${lang}`}
                      className="flex items-center justify-between px-4 py-3 rounded-lg bg-surface-900 border border-surface-800 hover:border-brand-500/40 hover:bg-surface-800/60 transition-colors group"
                    >
                      <span className="text-sm text-white group-hover:text-brand-400 transition-colors">
                        {formatDayLabel(date, lang)}
                      </span>
                      <span className="text-surface-600 group-hover:text-brand-500 transition-colors text-sm">
                        →
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer className="border-t border-surface-800 mt-10">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-surface-600">
          <span>© {new Date().getFullYear()} AI Marketer Daily by JE Labs</span>
          <span>{lang === 'zh' ? '仅供内部使用' : 'Internal use only'}</span>
        </div>
      </footer>

    </div>
  );
}
