"use client";

import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";

const sections = [
  { id: "highlight-summary", label: "Highlight", num: "00" },
  { id: "daily-brief", label: "Daily Brief", num: "01" },
  { id: "growth-insight", label: "Growth Insight", num: "02" },
  { id: "launch-radar", label: "Launch Radar", num: "03" },
  { id: "daily-case", label: "Daily Case", num: "04" },
  { id: "archive", label: "Archive", num: "05" },
];

function scrollTo(id: string) {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

export default function NewsScrollSpy({
  children,
}: {
  children: React.ReactNode;
}) {
  const [active, setActive] = useState("highlight-summary");
  // Track so we know which observer to use
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const main = document.querySelector("main");
    if (!main) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible.length > 0) {
          setActive(visible[0].target.id);
        }
      },
      {
        root: main,
        rootMargin: "-25% 0px -60% 0px",
        threshold: [0, 0.1, 0.3, 0.5],
      }
    );

    observerRef.current = observer;

    // Small delay to let DOM render sections
    const timer = setTimeout(() => {
      sections.forEach(({ id }) => {
        const el = document.getElementById(id);
        if (el) observer.observe(el);
      });
    }, 300);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
      observerRef.current = null;
    };
  }, []);

  return (
    <div className="relative flex gap-8 xl:gap-12">
      {/* Floating Quick Nav — hidden on mobile/tablet, visible on lg+ */}
      <aside className="hidden lg:block sticky top-40 w-[220px] flex-shrink-0 self-start">
        <nav className="rounded-2xl border border-surface-800 bg-surface-950/85 backdrop-blur-md p-3.5 space-y-0.5">
          <div className="text-[10px] uppercase tracking-widest text-surface-500 font-semibold mb-2.5 px-2.5">
            On this page
          </div>
          {sections.map((s) => {
            const isActive = active === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => scrollTo(s.id)}
                className={cn(
                  "w-full text-left flex items-center gap-3 px-2.5 py-2 rounded-lg transition-all duration-200 text-sm group",
                  isActive
                    ? "bg-brand-500/12 border border-brand-500/25 text-brand-400 shadow-[0_0_24px_rgba(6,245,183,0.06)]"
                    : "text-surface-400 hover:text-surface-200 hover:bg-surface-800/60 border border-transparent"
                )}
              >
                <span
                  className={cn(
                    "text-[10px] font-mono font-semibold w-6 flex-shrink-0 transition-colors",
                    isActive ? "text-brand-500" : "text-surface-600 group-hover:text-surface-400"
                  )}
                >
                  {s.num}
                </span>
                <span className="font-medium">{s.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Content */}
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}