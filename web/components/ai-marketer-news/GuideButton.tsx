"use client";

import { useState, useRef, useEffect } from "react";
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
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    // Delay to avoid the trigger click itself
    setTimeout(() => window.addEventListener("click", handler), 0);
    return () => window.removeEventListener("click", handler);
  }, [open]);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger button — inline with the top bar */}
      <button
        type="button"
        aria-label="Page guide"
        onClick={() => setOpen(!open)}
        className="group flex items-center gap-1.5 rounded-lg border border-surface-800 bg-surface-900/80 backdrop-blur-md px-2.5 py-2 text-[11px] uppercase tracking-widest text-surface-400 hover:text-brand-500 hover:border-brand-500/40 transition-all"
      >
        <HelpCircle className="h-3.5 w-3.5" strokeWidth={1.75} />
        <span className="hidden sm:inline">Guide</span>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-72 rounded-xl border border-surface-800 bg-surface-950 p-3 shadow-2xl z-50">
          <div className="space-y-1">
            {sections.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  scrollToSection(s.id);
                  setOpen(false);
                }}
                className="w-full text-left flex items-start gap-2.5 rounded-lg border border-transparent px-3 py-2.5 hover:border-surface-800 hover:bg-surface-900/80 transition-all cursor-pointer group"
              >
                <span className="text-base leading-none mt-0.5 flex-shrink-0">
                  {s.emoji}
                </span>
                <div className="min-w-0">
                  <p className="text-[12.5px] font-medium text-surface-200 group-hover:text-brand-500 transition-colors">
                    {s.title}
                  </p>
                  <p className="text-[11px] text-surface-500 leading-relaxed mt-0.5">
                    {s.desc}
                  </p>
                </div>
              </button>
            ))}
          </div>
          <p className="mt-2 text-[10px] text-surface-600 text-center">
            Press <kbd className="rounded border border-surface-800 bg-surface-900 px-1 py-0.5 text-surface-400 font-mono">Esc</kbd> to close
          </p>
        </div>
      )}
    </div>
  );
}
