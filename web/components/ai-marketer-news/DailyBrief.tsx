import type { Brief, Lang } from "@/lib/ai-marketer-news";
import { pickLang } from "@/lib/ai-marketer-news";
import SectionHeader from "./SectionHeader";
import { Newspaper, Target, ArrowUpRight } from "lucide-react";

export default function DailyBrief({
  items,
  lang = "en",
}: {
  items: Brief[];
  lang?: Lang;
}) {
  const labels =
    lang === "zh"
      ? {
          eyebrow: "01 · 每日要闻",
          title: "今天 6 条最值得读的 AI 新闻",
          soWhat: "对营销人意味着什么",
          source: "来源",
        }
      : {
          eyebrow: "01 · Daily Brief",
          title: "6 stories shaping today",
          soWhat: "So What for Marketer",
          source: "Source",
        };

  return (
    <section data-anchor id="daily-brief" className="mb-16">
      <SectionHeader
        eyebrow={labels.eyebrow}
        title={labels.title}
        count={items.length}
        icon={Newspaper}
      />
      <ol className="space-y-3">
        {items.map((b, i) => {
          const title = pickLang(b.title, b.title_zh, lang);
          const summary = pickLang(b.summary, b.summary_zh, lang);
          const soWhat = b.soWhat
            ? pickLang(b.soWhat, b.soWhat_zh, lang)
            : undefined;
          return (
            <li
              key={i}
              className="group rounded-xl border border-surface-800 bg-surface-900/60 backdrop-blur-sm p-5 sm:p-6 hover:border-brand-500/40 hover:shadow-glow-brand transition-all"
            >
              <div className="flex gap-5">
                <span className="font-mono text-[11px] tracking-tight text-surface-500 pt-[5px] w-7 flex-shrink-0 group-hover:text-brand-500 transition-colors">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="flex-1 min-w-0">
                  <h3 className="text-[19px] sm:text-[21px] font-bold leading-[1.3] tracking-[-0.01em] text-white">
                    {b.url ? (
                      <a
                        href={b.url}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-brand-500 transition-colors inline-flex items-start gap-1.5 group/title"
                      >
                        <span>{title}</span>
                        <ArrowUpRight
                          className="h-4 w-4 mt-1 flex-shrink-0 text-surface-500 group-hover/title:text-brand-500 transition-colors"
                          strokeWidth={1.75}
                        />
                      </a>
                    ) : (
                      title
                    )}
                  </h3>
                  <p className="mt-2 text-[15px] leading-[1.65] text-surface-300">
                    {summary}
                  </p>
                  {soWhat && (
                    <div className="mt-4 rounded-lg border border-brand-500/20 bg-brand-500/[0.05] px-4 py-3">
                      <div className="flex items-center gap-1.5 text-[10.5px] uppercase tracking-widest text-brand-500 mb-1.5 font-semibold">
                        <Target className="h-3 w-3" strokeWidth={1.75} />
                        {labels.soWhat}
                      </div>
                      <p className="text-[14.5px] leading-[1.65] text-surface-200">
                        {soWhat}
                      </p>
                    </div>
                  )}
                  <div className="mt-3 text-[11px] uppercase tracking-widest text-surface-500 font-medium">
                    {b.url ? (
                      <a
                        href={b.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 hover:text-brand-500 transition-colors"
                      >
                        {labels.source} · {b.source}
                        <ArrowUpRight className="h-3 w-3" strokeWidth={1.75} />
                      </a>
                    ) : (
                      <>{labels.source} · {b.source}</>
                    )}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
