"use client";

import type { DailyCase } from "@/lib/ai-marketer-news";
import SectionHeader from "./SectionHeader";
import { BookOpen } from "lucide-react";

export default function DailyCaseSection({ caseItem }: { caseItem: DailyCase }) {
  return (
    <section data-anchor id="daily-case" className="mb-20">
      <SectionHeader
        eyebrow="04 · Daily Case"
        title="Daily case teardown"
        icon={BookOpen}
      />
      <article className="rounded-xl border border-surface-800 bg-surface-900/60 backdrop-blur-sm overflow-hidden">
        <div className="px-6 sm:px-10 pt-8 pb-6 border-b border-surface-800 bg-gradient-to-br from-brand-500/[0.08] via-transparent to-transparent">
          <div className="text-[11px] uppercase tracking-widest text-brand-500 font-semibold">
            Case Study · {caseItem.company}
          </div>
          <h3 className="mt-3 text-[26px] sm:text-[34px] font-bold leading-[1.1] tracking-[-0.025em] text-white">
            {caseItem.title}
          </h3>
          <p className="mt-4 text-[20px] sm:text-[22px] font-bold leading-[1.5] text-surface-100">
            {caseItem.deck}
          </p>
          {caseItem.metrics && caseItem.metrics.length > 0 && (
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {caseItem.metrics.map((m, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-surface-800 bg-surface-950/60 px-3.5 py-3"
                >
                  <div className="text-[10px] uppercase tracking-widest text-surface-500 mb-1.5 font-semibold">
                    Metric {i + 1}
                  </div>
                  <div className="text-[13.5px] text-white font-semibold leading-snug">
                    {m}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {caseItem.bodyHtml && (
          <div
            className="case-prose px-6 sm:px-10 py-8"
            dangerouslySetInnerHTML={{ __html: caseItem.bodyHtml }}
          />
        )}
      </article>
    </section>
  );
}
