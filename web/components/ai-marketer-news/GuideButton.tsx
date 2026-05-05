"use client";

import { useState, useEffect } from "react";
import { HelpCircle, X } from "lucide-react";

const sections = [
  {
    id: "highlight",
    emoji: "✨",
    title: "Highlight Summary",
    desc: "Top AI marketing story of the day — the one thing you need to know.",
  },
  {
    id: "daily-brief",
    emoji: "📡",
    title: "Daily Brief",
    desc: "Quick-hit AI marketing news across product launches, policy shifts, and industry moves.",
  },
  {
    id: "growth-insight",
    emoji: "📈",
    title: "Growth Insight",
    desc: "Deep-dive analysis on growth strategies, distribution plays, and go-to-market tactics.",
  },
  {
    id: "launch-radar",
    emoji: "🚀",
    title: "Launch Radar",
    desc: "New AI product launches and feature releases worth watching.",
  },
  {
    id: "daily-case",
    emoji: "🎯",
    title: "Daily Case",
    desc: "Real-world marketing case study — what worked, what didn't, and why.",
  },
  {
    id: "past-issues",
    emoji: "📚",
    title: "Past Issues",
    desc: "Browse previous newsletters to catch up on what you missed.",
  },
];

function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

export default function GuideButton() {
  const [open, setOpen] = useState(false);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  return (
    <>
      {/* Floating trigger button */}
      <button
        type="button"
        aria-label="Page guide"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 left-5 sm:left-8 z-40 flex items-center gap-1.5 rounded-full border border-surface-800 bg-surface-900/80 backdrop-blur-md px-3.5 py-2.5 text-[11px] uppercase tracking-widest text-surface-400 hover:text-brand-500 hover:border-brand-500/40 transition-all opacity-0 translate-y-3 animate-[fadeInUp_0.4s_ease-out_0.5s_forwards]"
      >
        <HelpCircle className="h-3.5 w-3.5" strokeWidth={1.75} />
        <span>Guide</span>
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Modal */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md rounded-2xl border border-surface-800 bg-surface-950 p-6 shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-semibold text-white">
                  AI News Guide
                </h2>
                <p className="text-[12px] text-surface-500 mt-0.5">
                  Click a section to jump to it
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-surface-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-surface-800"
                aria-label="Close guide"
              >
                <X className="h-4 w-4" strokeWidth={1.75} />
              </button>
            </div>

            {/* Sections list */}
            <div className="space-y-2">
              {sections.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    scrollToSection(s.id);
                    setOpen(false);
                  }}
                  className="w-full text-left flex items-start gap-3 rounded-xl border border-surface-800/60 bg-surface-900/40 px-3.5 py-3 hover:border-brand-500/40 hover:bg-surface-900/80 transition-all cursor-pointer group"
                >
                  <span className="text-base leading-none mt-0.5 flex-shrink-0">
                    {s.emoji}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-surface-200 group-hover:text-brand-500 transition-colors">
                      {s.title}
                    </p>
                    <p className="text-[12px] text-surface-500 leading-relaxed mt-0.5">
                      {s.desc}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            {/* Footer hint */}
            <p className="mt-4 text-[11px] text-surface-600 text-center">
              Press <kbd className="rounded border border-surface-800 bg-surface-900 px-1.5 py-0.5 text-surface-400 font-mono">Esc</kbd> to close
            </p>
          </div>
        </div>
      )}
    </>
  );
}
