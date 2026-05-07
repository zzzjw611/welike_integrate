import type { Highlight, Lang } from "@/lib/ai-marketer-news";
import { Zap } from "lucide-react";

export default function HighlightSummary({
  highlight,
  lang = "en",
}: {
  highlight?: Highlight;
  lang?: Lang;
}) {
  if (!highlight?.bullets || highlight.bullets.length === 0) return null;
  // Prefer parallel zh array when present and same length; otherwise fall back
  // to English so older issues without _zh still render.
  const bullets =
    lang === "zh" &&
    highlight.bullets_zh &&
    highlight.bullets_zh.length === highlight.bullets.length
      ? highlight.bullets_zh
      : highlight.bullets;

  const eyebrow =
    lang === "zh" ? "TL;DR · 今日要点" : "TL;DR · Today's Highlight";
  const heading =
    lang === "zh"
      ? "今日 AI 营销简报概览"
      : "Today's AI marketing brief at a glance";

  return (
    <section data-anchor id="highlight-summary" className="mb-16">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 text-[11px] uppercase tracking-widest font-medium">
            <Zap className="h-3.5 w-3.5 text-brand-500" strokeWidth={1.75} />
            <span className="text-brand-500">{eyebrow}</span>
          </div>
          <h2 className="mt-2 text-[28px] sm:text-[32px] font-bold leading-tight tracking-[-0.02em] text-white">
            {heading}
          </h2>
        </div>
      </div>

      <div className="rounded-xl border border-brand-500/25 bg-gradient-to-br from-brand-500/[0.06] via-surface-900/60 to-surface-900/60 backdrop-blur-sm p-6 sm:p-7 shadow-glow-brand">
        <ul className="space-y-3">
          {bullets.map((b, i) => (
            <li
              key={i}
              className="flex items-start gap-3 text-[14.5px] leading-[1.65] text-surface-200"
            >
              <span className="mt-[8px] h-1 w-1 rounded-full bg-brand-500 flex-shrink-0" />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
