"use client";

import type { DailyCase } from "@/lib/ai-marketer-news";
// pickLang/Lang come from the client-safe shared module so this "use client"
// component doesn't drag fs/path/etc from the server-side lib into the
// browser bundle (UnhandledSchemeError on node:fs/promises during build).
import { pickLang, type Lang } from "@/lib/ai-marketer-news-shared";
import SectionHeader from "./SectionHeader";
import { BookOpen } from "lucide-react";

export default function DailyCaseSection({
  caseItem,
  lang = "en",
}: {
  caseItem: DailyCase;
  lang?: Lang;
}) {
  const labels =
    lang === "zh"
      ? {
          eyebrow: "04 · 案例拆解",
          title: "今日案例",
          caseStudy: "案例 · ",
          metric: "指标",
        }
      : {
          eyebrow: "04 · Daily Case",
          title: "Daily case teardown",
          caseStudy: "Case Study · ",
          metric: "Metric",
        };

  const title = pickLang(caseItem.title, caseItem.title_zh, lang);
  const deck = pickLang(caseItem.deck, caseItem.deck_zh, lang);
  const metrics =
    lang === "zh" && caseItem.metrics_zh && caseItem.metrics_zh.length > 0
      ? caseItem.metrics_zh
      : caseItem.metrics;
  const bodyHtml =
    lang === "zh" && caseItem.bodyHtml_zh
      ? caseItem.bodyHtml_zh
      : caseItem.bodyHtml;

  return (
    <section data-anchor id="daily-case" className="mb-20">
      <SectionHeader
        eyebrow={labels.eyebrow}
        title={labels.title}
        icon={BookOpen}
      />
      <article className="rounded-xl border border-surface-800 bg-surface-900/60 backdrop-blur-sm overflow-hidden">
        <div className="px-6 sm:px-10 pt-8 pb-6 border-b border-surface-800 bg-gradient-to-br from-brand-500/[0.08] via-transparent to-transparent">
          <div className="text-[11px] uppercase tracking-widest text-brand-500 font-semibold">
            {labels.caseStudy}{caseItem.company}
          </div>
          <h3 className="mt-3 text-[26px] sm:text-[34px] font-bold leading-[1.1] tracking-[-0.025em] text-white">
            {title}
          </h3>
          <p className="mt-4 text-[15px] leading-[1.6] text-surface-300">
            {deck}
          </p>
          {metrics && metrics.length > 0 && (
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {metrics.map((m, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-surface-800 bg-surface-950/60 px-3.5 py-3"
                >
                  <div className="text-[10px] uppercase tracking-widest text-surface-500 mb-1.5 font-semibold">
                    {labels.metric} {i + 1}
                  </div>
                  <div className="text-[13.5px] text-white font-semibold leading-snug">
                    {m}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {bodyHtml && (
          <div
            className="case-prose px-6 sm:px-10 py-8"
            dangerouslySetInnerHTML={{ __html: bodyHtml }}
          />
        )}
      </article>
    </section>
  );
}
