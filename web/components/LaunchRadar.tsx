import type { Article, Lang } from '@/lib/types';

interface Props {
  articles: Article[];
  lang: Lang;
}

function sourceName(url: string): string {
  try { return new URL(url).hostname.replace(/^www\./, ''); }
  catch { return 'Source'; }
}

export default function LaunchRadar({ articles, lang }: Props) {
  if (!articles.length) return null;

  return (
    <section>
      <h2 className="text-xs font-bold uppercase tracking-widest text-brand-500 mb-5">
        🚀 {lang === 'zh' ? '发布雷达' : 'Launch Radar'}
      </h2>

      <div className="space-y-6">
        {articles.map((a) => {
          const title       = lang === 'zh' ? a.title_zh   : a.title_en;
          const what        = lang === 'zh' ? a.content_zh : a.content_en;
          const positioning = lang === 'zh'
            ? a.extra?.positioning_zh
            : a.extra?.positioning_en;
          const takeaway = lang === 'zh' ? a.so_what_zh : a.so_what_en;

          return (
            <article
              key={a.id}
              className="rounded-xl bg-surface-900 border border-surface-800 p-6 hover:border-brand-500/30 transition-colors"
            >
              {/* Product name + platform badge */}
              <div className="flex items-start justify-between gap-4 mb-5">
                <h3 className="text-base font-semibold text-white leading-snug">{title}</h3>
                {a.extra?.platform_data && (
                  <span className="shrink-0 text-[11px] text-surface-500 bg-surface-800 rounded-full px-3 py-1 whitespace-nowrap">
                    {a.extra.platform_data}
                  </span>
                )}
              </div>

              {/* What */}
              <div className="mb-4">
                <p className="text-xs font-bold text-surface-500 uppercase tracking-wide mb-1.5">
                  {lang === 'zh' ? '产品是什么' : 'What'}
                </p>
                <p className="text-sm text-surface-400 leading-relaxed">{what}</p>
              </div>

              {/* Positioning Read */}
              {positioning && (
                <div className="mb-4">
                  <p className="text-xs font-bold text-surface-500 uppercase tracking-wide mb-1.5">
                    Positioning Read
                  </p>
                  <p className="text-sm text-surface-400 leading-relaxed">{positioning}</p>
                </div>
              )}

              {/* Marketer Takeaway */}
              {takeaway && (
                <div className="rounded-lg bg-brand-500/5 border border-brand-500/20 px-4 py-3 mb-4">
                  <p className="text-sm text-surface-300 leading-relaxed">
                    <strong className="text-brand-500">👉 Marketer Takeaway:</strong>{' '}{takeaway}
                  </p>
                </div>
              )}

              {/* Sources */}
              {a.sources.length > 0 && (
                <p className="text-[11px] text-surface-600">
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
