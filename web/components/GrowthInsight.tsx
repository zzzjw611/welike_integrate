import type { Article, Lang } from '@/lib/types';

interface Props {
  articles: Article[];
  lang: Lang;
}

function sourceName(url: string): string {
  try { return new URL(url).hostname.replace(/^www\./, ''); }
  catch { return 'Source'; }
}

export default function GrowthInsight({ articles, lang }: Props) {
  if (articles.length === 0) {
    return (
      <section>
        <h2 className="text-xs font-bold uppercase tracking-widest text-brand-500 mb-5">
          💡 {lang === 'zh' ? '增长洞察' : 'Growth Insight'}
        </h2>
        <p className="text-sm text-surface-600 italic">
          {lang === 'zh'
            ? '今日休刊 — 今天没有特别值得推荐的增长观点，宁缺毋滥。'
            : 'Day off — no growth insights worth recommending today. Quality over quantity.'}
        </p>
      </section>
    );
  }

  return (
    <section>
      <h2 className="text-xs font-bold uppercase tracking-widest text-brand-500 mb-5">
        💡 {lang === 'zh' ? '增长洞察' : 'Growth Insight'}
      </h2>

      <div className="space-y-8">
        {articles.map((a) => {
          const author  = lang === 'zh' ? a.title_zh   : a.title_en;
          const quote   = lang === 'zh' ? a.content_zh : a.content_en;
          const context = lang === 'zh' ? a.extra?.context_zh : a.extra?.context_en;
          const insight = lang === 'zh' ? a.so_what_zh : a.so_what_en;

          return (
            <article
              key={a.id}
              className="rounded-xl bg-surface-900 border border-surface-800 p-6 hover:border-brand-500/30 transition-colors"
            >
              {/* Author + platform */}
              <p className="text-xs font-semibold text-brand-500 mb-3">{author}</p>

              {/* Quote in blockquote */}
              <blockquote className="border-l-2 border-brand-500/40 pl-4 mb-5">
                <p className="text-sm text-surface-200 leading-relaxed italic">{quote}</p>
              </blockquote>

              {/* 背景 / Context */}
              {context && (
                <div className="mb-4">
                  <p className="text-xs font-bold text-surface-500 uppercase tracking-wide mb-1.5">
                    📍 {lang === 'zh' ? '背景' : 'Context'}
                  </p>
                  <p className="text-sm text-surface-400 leading-relaxed">{context}</p>
                </div>
              )}

              {/* 启发 / Insight */}
              {insight && (
                <div className="rounded-lg bg-brand-500/5 border border-brand-500/20 px-4 py-3 mb-4">
                  <p className="text-xs font-bold text-brand-500 mb-1.5">
                    👉 {lang === 'zh' ? '启发' : 'Insight'}
                  </p>
                  <p className="text-sm text-surface-300 leading-relaxed">{insight}</p>
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
