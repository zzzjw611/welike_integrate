"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = () => setVisible(window.scrollY > 600);
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <button
      type="button"
      aria-label="Back to top"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={`fixed bottom-6 right-5 sm:bottom-8 sm:right-8 z-40 group flex items-center gap-2 rounded-full border border-surface-800 bg-surface-900/80 backdrop-blur-md px-4 py-2.5 text-[11px] uppercase tracking-widest text-surface-400 hover:text-brand-500 hover:border-brand-500/40 transition-all ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3 pointer-events-none"
      }`}
    >
      <ArrowUp className="h-3.5 w-3.5" strokeWidth={1.75} />
      <span>Top</span>
    </button>
  );
}
