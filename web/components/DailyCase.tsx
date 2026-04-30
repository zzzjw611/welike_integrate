import type { Article, Lang } from '@/lib/types';

interface Props {
  article: Article | null;
  lang: Lang;
}

function sourceName(url: string): string {
  try { return new URL(url).hostname.replace(/^www\./, ''); }
  catch { return 'Source'; }
}

export default function DailyCase({ article, lang }: Props) {
  if (!article) return null;

  const title      = lang === 'zh' ? article.title_zh   : article.title_en;
  const background = lang === 'zh' ? article.content_zh : article.content_en;
  const breakdown  = lang === 'zh'
    ? article.extra?.breakdown_zh
    : article.extra?.breakdown_en;
  const actions = lang === 'zh' ? article.so_what_zh : article.so_what_en;

  return (
    <section>
      <h2 className="text-xs font-bold uppercase tracking-widest text-brand-500 mb-5">
        📚 {lang === 'zh' ? '案例拆解' : 'Daily Case'}
      </h2>

      <article className="rounded-xl bg-gradient-to-br from-surface-900 to-brand-500/5 border border-brand-500/20 p-7">

        {/* 🎯 Case title */}
        <h3 className="text-lg font-bold text-white leading-snug mb-6">
          🎯 {title}
        </h3>

        {/* 📊 Background & data */}
        <div className="mb-6">
          <p className="text-xs font-bold text-surface-500 uppercase tracking-wide mb-2">
            📊 {lang === 'zh' ? '背景与数据' : 'Background & Data'}
          </p>
          <p className="text-sm text-surface-300 leading-relaxed">{background}</p>
        </div>

        {/* 🔍 Breakdown */}
        {breakdown && (
          <div className="mb-6">
            <p className="text-xs font-bold text-surface-500 uppercase tracking-wide mb-2">
              🔍 {lang === 'zh' ? '拆解' : 'Breakdown'}
            </p>
            <p className="text-sm text-surface-300 leading-relaxed whitespace-pre-line">
              {breakdown}
            </p>
          </div>
        )}

        {/* 💡 How to use */}
        {actions && (
          <div className="rounded-lg bg-brand-500/10 border border-brand-500/30 px-5 py-4 mb-5">
            <p className="text-xs font-bold text-brand-500 uppercase tracking-wider mb-2">
              💡 {lang === 'zh' ? '你可以怎么用' : 'How You Can Use This'}
            </p>
            <p className="text-sm text-surface-200 leading-relaxed whitespace-pre-line">
              {actions}
            </p>
          </div>
        )}

        {/* Sources */}
        {article.sources.length > 0 && (
          <p className="text-[11px] text-surface-600">
            {article.sources.map((src, i) => (
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
    </section>
  );
}
