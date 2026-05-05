"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ArrowUpRight, History } from "lucide-react";
import type { IssueSummary } from "@/lib/ai-marketer-news";

function formatBar(iso: string) {
  const d = new Date(iso + "T00:00:00");
  const month = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][d.getMonth()];
  const weekdayEn = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][d.getDay()];
  return {
    short: `${month} ${d.getDate()}`,
    weekday: weekdayEn,
  };
}

export default function PastIssues({ issues }: { issues: IssueSummary[] }) {
  const [openId, setOpenId] = useState<string | null>(null);

  if (!issues || issues.length === 0) return null;

  return (
    <section data-anchor id="archive" className="mb-16">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 text-[11px] uppercase tracking-widest font-medium">
            <History className="h-3.5 w-3.5 text-brand-500" strokeWidth={1.75} />
            <span className="text-brand-500">Archive · Recent issues</span>
            <span className="text-surface-500">· {issues.length} issue{issues.length === 1 ? "" : "s"}</span>
          </div>
          <h2 className="mt-2 text-[28px] sm:text-[32px] font-bold leading-tight tracking-[-0.02em] text-white">
            Catch up on the past few days
          </h2>
        </div>
      </div>

      <ul className="space-y-2">
        {issues.map((iss) => {
          const isOpen = openId === iss.date;
          const { short, weekday } = formatBar(iss.date);
          return (
            <li
              key={iss.date}
              className="rounded-xl border border-surface-800 bg-surface-900/60 backdrop-blur-sm overflow-hidden transition-colors hover:border-surface-700"
            >
              <button
                type="button"
                onClick={() => setOpenId(isOpen ? null : iss.date)}
                aria-expanded={isOpen}
                className="w-full flex items-center gap-4 px-4 sm:px-5 py-3.5 text-left group"
              >
                <div className="flex items-baseline gap-2 w-[110px] flex-shrink-0">
                  <span className="text-[11px] uppercase tracking-widest text-surface-500 font-semibold">
                    {weekday}
                  </span>
                  <span className="text-[14px] font-semibold text-white">
                    {short}
                  </span>
                </div>
                {iss.issueNumber && (
                  <span className="hidden sm:inline text-[10.5px] uppercase tracking-widest text-surface-500 font-semibold w-[70px] flex-shrink-0">
                    № {String(iss.issueNumber).padStart(3, "0")}
                  </span>
                )}
                <span className="flex-1 text-[13px] text-surface-300 truncate">
                  <span className="text-surface-500">Case · </span>
                  {iss.daily_case.title || iss.daily_case.company || "—"}
                </span>
                <span className="hidden sm:inline text-[10.5px] uppercase tracking-widest text-surface-500 font-medium">
                  {iss.briefs.length}·{iss.growth_insights.length}·{iss.launches.length}·1
                </span>
                <ChevronDown
                  className={`h-4 w-4 text-surface-500 group-hover:text-brand-500 transition-all flex-shrink-0 ${
                    isOpen ? "rotate-180 text-brand-500" : ""
                  }`}
                  strokeWidth={1.75}
                />
              </button>

              {isOpen && (
                <div className="px-4 sm:px-5 pb-5 pt-1 border-t border-surface-800 space-y-5">
                  {iss.briefs.length > 0 && (
                    <div>
                      <div className="text-[10.5px] uppercase tracking-widest text-brand-500 font-semibold mb-2.5 mt-4">
                        Daily Brief
                      </div>
                      <ol className="space-y-1.5">
                        {iss.briefs.map((b, i) => (
                          <li
                            key={i}
                            className="flex gap-3 text-[13px] leading-[1.5] text-surface-300"
                          >
                            <span className="text-surface-500 font-mono text-[11px] pt-[3px] w-5 flex-shrink-0">
                              {String(i + 1).padStart(2, "0")}
                            </span>
                            <span>
                              {b.url ? (
                                <a
                                  href={b.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="hover:text-brand-500 transition-colors"
                                >
                                  {b.title}
                                </a>
                              ) : (
                                b.title
                              )}
                            </span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {iss.growth_insights.length > 0 && (
                    <div>
                      <div className="text-[10.5px] uppercase tracking-widest text-brand-500 font-semibold mb-2.5">
                        Growth Insight
                      </div>
                      <ul className="space-y-2">
                        {iss.growth_insights.map((g, i) => (
                          <li key={i} className="text-[13px] leading-[1.5] text-surface-300">
                            <span className="text-white font-semibold">{g.author}</span>
                            <span className="text-surface-500"> · {g.handle}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {iss.launches.length > 0 && (
                    <div>
                      <div className="text-[10.5px] uppercase tracking-widest text-brand-500 font-semibold mb-2.5">
                        Launch Radar
                      </div>
                      <ul className="space-y-1.5">
                        {iss.launches.map((l, i) => (
                          <li
                            key={i}
                            className="flex gap-3 text-[13px] leading-[1.5] text-surface-300"
                          >
                            <span className="text-white font-semibold">{l.product}</span>
                            <span className="text-surface-500">by {l.company}</span>
                            {l.tag && (
                              <span className="text-[10px] uppercase tracking-widest text-brand-500 font-semibold pt-[2px]">
                                {l.tag}
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {iss.daily_case.title && (
                    <div>
                      <div className="text-[10.5px] uppercase tracking-widest text-brand-500 font-semibold mb-2.5">
                        Daily Case · {iss.daily_case.company}
                      </div>
                      <div className="text-[13.5px] leading-[1.55] text-surface-200 font-semibold">
                        {iss.daily_case.title}
                      </div>
                      {iss.daily_case.deck && (
                        <p className="mt-1.5 text-[12.5px] leading-[1.6] text-surface-400">
                          {iss.daily_case.deck}
                        </p>
                      )}
                    </div>
                  )}

                  <Link
                    href={`/tools/news/archive/${iss.date}`}
                    className="inline-flex items-center gap-1.5 mt-1 text-[11px] uppercase tracking-widest text-brand-500 hover:text-brand-400 font-semibold"
                  >
                    Read the full issue
                    <ArrowUpRight className="h-3 w-3" strokeWidth={2} />
                  </Link>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
