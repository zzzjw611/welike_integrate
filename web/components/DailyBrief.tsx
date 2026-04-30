import type { Article, Lang } from '@/lib/types';

interface Props {
  articles: Article[];
  lang: Lang;
}

function sourceName(url: string): string {
  try { return new URL(url).hostname.replace(/^www\./, ''); }
  catch { return 'Source'; }
}

function daysAgo(articleDate: string): number {
  const today = new Date().toISOString().slice(0, 10);
  const ms = new Date(today + 'T00:00:00Z').getTime()
           - new Date(articleDate + 'T00:00:00Z').getTime();
  return Math.round(ms / 86_400_000);
}

export default function DailyBrief({ articles, lang }: Props) {
  if (!articles.length) return null;

  return (
    <section>
      <h2 className="text-xs font-bold uppercase tracking-widest text-brand-500 mb-5">
        📅 {lang === 'zh' ? '每日要闻' : 'Daily Brief'}
      </h2>

      <div className="space-y-6">
        {articles.map((a) => {
          const title  = lang === 'zh' ? a.title_zh   : a.title_en;
          const fact   = lang === 'zh' ? a.content_zh : a.content_en;
          const soWhat = lang === 'zh' ? a.so_what_zh : a.so_what_en;
          const ago    = daysAgo(a.date);

          return (
            <article
              key={a.id}
              className="border-l-2 border-surface-800 pl-4 hover:border-brand-500/50 transition-colors"
            >
              <div className="flex items-baseline gap-2 mb-1.5 flex-wrap">
                <h3 className="text-sm font-semibold text-white leading-snug">{title}</h3>
                {ago > 0 && (
                  <span className="shrink-0 text-[11px] text-surface-600">
                    (reported {ago} day{ago !== 1 ? 's' : ''} ago)
                  </span>
                )}
              </div>

              <p className="text-sm text-surface-400 leading-relaxed">{fact}</p>

              {soWhat && (
                <p className="mt-2 text-xs leading-relaxed text-surface-300">
                  <strong className="text-brand-500">👉 So What:</strong>{' '}{soWhat}
                </p>
              )}

              {a.sources.length > 0 && (
                <p className="mt-2 text-[11px] text-surface-600">
                  {a.sources.map((src, i) => (
                    <span key={src}>
                      {i > 0 && <span className="mx-1.5 text-surface-700">·</span>}
                      {'🔗 '}
                      <a
                        href={src}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-brand-500 transition-colors hover:underline underline-offset-2"
                      >
                        {sourceName(src)}
                      </a>
                    </span>
                  ))}
                </p>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
