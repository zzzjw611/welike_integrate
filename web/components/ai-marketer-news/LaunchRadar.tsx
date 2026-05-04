import type { Launch } from "@/lib/ai-marketer-news";
import SectionHeader from "./SectionHeader";
import { Rocket, ArrowUpRight } from "lucide-react";

const tagStyle: Record<string, string> = {
  "Big AI": "bg-brand-500 text-black border-transparent",
  "Funded": "bg-brand-500/10 text-brand-500 border-brand-500/30",
  "Rising": "bg-surface-800 text-surface-200 border-surface-700",
};

export default function LaunchRadar({ items }: { items: Launch[] }) {
  return (
    <section data-anchor id="launch-radar" className="mb-16">
      <SectionHeader
        eyebrow="03 · Launch Radar"
        title="2 launches worth a look today"
        count={items.length}
        icon={Rocket}
      />
      <div className="space-y-4">
        {items.map((l, i) => (
          <article
            key={i}
            className="rounded-xl border border-surface-800 bg-surface-900/60 backdrop-blur-sm overflow-hidden hover:border-brand-500/40 transition-colors"
          >
            <div className="px-6 sm:px-7 pt-5 pb-4 border-b border-surface-800 flex items-center justify-between gap-3">
              <div className="text-[11px] uppercase tracking-widest text-surface-500 font-medium">
                {l.category}
              </div>
              {l.tag && (
                <span
                  className={`text-[10px] uppercase tracking-widest font-semibold px-2.5 py-1 rounded-md border ${tagStyle[l.tag] ?? ""}`}
                >
                  {l.tag}
                </span>
              )}
            </div>
            <div className="px-6 sm:px-7 py-6">
              <h3 className="text-[24px] sm:text-[28px] font-bold leading-tight tracking-[-0.02em] text-white">
                {l.product}
              </h3>
              <div className="mt-1 text-[13px] text-surface-500">by {l.company}</div>
              <p className="mt-4 text-[14.5px] leading-[1.65] text-surface-300">
                {l.summary}
              </p>
              <dl className="mt-5 grid sm:grid-cols-2 gap-x-6 gap-y-2.5 text-[13px]">
                {l.funding && (
                  <div className="flex gap-3">
                    <dt className="uppercase tracking-widest text-surface-500 w-20 flex-shrink-0 pt-[2px] text-[10.5px] font-semibold">
                      Funding
                    </dt>
                    <dd className="text-surface-200">{l.funding}</dd>
                  </div>
                )}
                {l.metric && (
                  <div className="flex gap-3">
                    <dt className="uppercase tracking-widest text-surface-500 w-20 flex-shrink-0 pt-[2px] text-[10.5px] font-semibold">
                      Traction
                    </dt>
                    <dd className="text-surface-200">{l.metric}</dd>
                  </div>
                )}
              </dl>
            </div>
            {l.url && (
              <a
                href={l.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between px-6 sm:px-7 py-4 border-t border-surface-800 text-[11px] uppercase tracking-widest text-surface-300 hover:text-brand-500 hover:bg-brand-500/[0.04] transition-colors font-medium"
              >
                <span>Visit {l.product}</span>
                <ArrowUpRight className="h-4 w-4" strokeWidth={1.75} />
              </a>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
