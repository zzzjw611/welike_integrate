"use client";

import type { DailyCase } from "@/lib/ai-marketer-news";
import SectionHeader from "./SectionHeader";
import { BookOpen, ChevronDown } from "lucide-react";
import { useState } from "react";

export default function DailyCaseSection({ caseItem }: { caseItem: DailyCase }) {
  const [expanded, setExpanded] = useState(false);

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
          <p className="mt-4 text-[15.5px] leading-[1.65] text-surface-300">
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
          <>
            <div className="px-6 sm:px-10 pt-6 pb-2">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-surface-400 font-semibold">
                <span className="h-px flex-1 bg-surface-800" />
                <span>Full Case Study</span>
                <span className="h-px flex-1 bg-surface-800" />
              </div>
            </div>
            <div
              className={`case-prose px-6 sm:px-10 pb-8 transition-all duration-300 ${
                expanded ? "" : "max-h-[320px] overflow-hidden relative"
              }`}
            >
              <div
                dangerouslySetInnerHTML={{ __html: caseItem.bodyHtml }}
              />
              {!expanded && (
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-surface-900 to-transparent pointer-events-none" />
              )}
            </div>
            <div className="px-6 sm:px-10 pb-8">
              <button
                onClick={() => setExpanded(!expanded)}
                className="group w-full flex items-center justify-center gap-2 rounded-lg border border-surface-700 bg-surface-800/50 px-4 py-2.5 text-[12px] font-medium text-surface-300 hover:text-brand-500 hover:border-brand-500/40 hover:bg-brand-500/[0.05] transition-all"
              >
                <span>{expanded ? "Collapse" : "Read full case study"}</span>
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform duration-200 ${
                    expanded ? "rotate-180" : ""
                  }`}
                  strokeWidth={1.75}
                />
              </button>
            </div>
          </>
        )}
      </article>
    </section>
  );
}
