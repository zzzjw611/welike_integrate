import type { GrowthInsight, Lang } from "@/lib/ai-marketer-news";
import { pickLang } from "@/lib/ai-marketer-news";
import SectionHeader from "./SectionHeader";
import { TrendingUp, ArrowUpRight, Sparkles } from "lucide-react";

export default function GrowthInsightSection({
  items,
  lang = "en",
}: {
  items: GrowthInsight[];
  lang?: Lang;
}) {
  const labels =
    lang === "zh"
      ? {
          eyebrow: "02 · 增长洞察",
          title: "今天增长操盘手在说什么",
          ourTake: "我们的解读",
          viewOn: "在",
        }
      : {
          eyebrow: "02 · Growth Insight",
          title: "What growth operators are saying today",
          ourTake: "Our Take",
          viewOn: "View on",
        };

  return (
    <section data-anchor id="growth-insight" className="mb-16">
      <SectionHeader
        eyebrow={labels.eyebrow}
        title={labels.title}
        count={items.length}
        icon={TrendingUp}
      />
      <div className="space-y-4">
        {items.map((g, i) => {
          const quote = pickLang(g.quote, g.quote_zh, lang);
          const commentary = g.commentary
            ? pickLang(g.commentary, g.commentary_zh, lang)
            : undefined;
          return (
            <article
              key={i}
              className="rounded-xl border border-surface-800 bg-surface-900/60 backdrop-blur-sm p-6 sm:p-7 hover:border-brand-500/40 transition-colors"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="text-[10.5px] uppercase tracking-widest text-surface-500 font-medium">
                  {g.platform ?? "X"}  ·  {String(i + 1).padStart(2, "0")}
                </div>
                {g.url && (
                  <a
                    href={g.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] uppercase tracking-widest text-surface-500 hover:text-brand-500 transition-colors font-medium"
                  >
                    {labels.viewOn} {g.platform ?? "X"}
                    <ArrowUpRight className="h-3 w-3" strokeWidth={1.75} />
                  </a>
                )}
              </div>
              <blockquote className="relative pl-4 border-l-2 border-brand-500/40 text-[14.5px] leading-[1.65] text-surface-200">
                {quote}
              </blockquote>
              <div className="mt-3 text-[13px] text-surface-400">
                <span className="font-semibold text-white">{g.author}</span>
                <span className="text-surface-500"> · {g.handle}</span>
              </div>
              {commentary && (
                <div className="mt-5 pt-5 border-t border-surface-800">
                  <div className="flex items-center gap-1.5 text-[10.5px] uppercase tracking-widest text-brand-500 mb-2 font-semibold">
                    <Sparkles className="h-3 w-3" strokeWidth={1.75} />
                    {labels.ourTake}
                  </div>
                  <p className="text-[14.5px] leading-[1.65] text-surface-200">
                    {commentary}
                  </p>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
