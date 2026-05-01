"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useLang } from "@/lib/use-lang";
import SocialListening from "@/components/SocialListening";
import SmartAlerts from "@/components/social-listening/SmartAlerts";
import { t } from "@/components/social-listening/i18n";
import { Radio, Bell, Activity, Globe } from "lucide-react";

// ===== Staggered entrance animation hook =====
function useStaggeredEntrance(staggerDelay = 0.06) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const children = el.querySelectorAll("[data-stagger]");
    children.forEach((child, i) => {
      const htmlChild = child as HTMLElement;
      htmlChild.style.opacity = "0";
      htmlChild.style.transform = "translateY(24px)";
      htmlChild.style.transition = "opacity 0.55s ease-out, transform 0.55s ease-out";
      htmlChild.style.transitionDelay = `${i * staggerDelay}s`;
      requestAnimationFrame(() => {
        htmlChild.style.opacity = "1";
        htmlChild.style.transform = "translateY(0)";
      });
    });
  }, [staggerDelay]);
  return ref;
}

export default function SocialListeningPage() {
  const lang = useLang();
  const [view, setView] = useState<"analyze" | "alerts">("analyze");
  const [alertQuery, setAlertQuery] = useState<string | undefined>(undefined);
  const staggerRef = useStaggeredEntrance(0.06);

  const switchToAlerts = useCallback((query: string) => {
    setAlertQuery(query);
    setView("alerts");
  }, []);

  const handleAlertCreated = useCallback(() => {
    setAlertQuery(undefined);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <svg className="h-7 w-7" viewBox="0 0 40 40" aria-hidden="true">
            <g fill="#06F5B7">
              <path d="M20 4 C16 4 14 8 14 12 C14 14 15 16 17 17 C13 18 8 20 8 26 C8 30 12 32 16 32 C18 32 19 31 20 30 C21 31 22 32 24 32 C28 32 32 30 32 26 C32 20 27 18 23 17 C25 16 26 14 26 12 C26 8 24 4 20 4 Z"/>
            </g>
          </svg>
          <div>
            <div className="text-sm font-semibold text-white">WeLike</div>
            <div className="text-[10px] font-mono text-surface-500">{t("title", lang)}</div>
          </div>
        </div>
        <nav className="flex items-center gap-1 rounded-lg border border-surface-800 bg-surface-900 p-0.5">
          <button onClick={() => setView("analyze")}
            className={`rounded-md px-4 py-1.5 text-xs font-medium transition-colors inline-flex items-center gap-1.5 ${
              view === "analyze" ? "bg-brand-500/10 text-brand-500" : "text-surface-400 hover:text-surface-200"
            }`}>
            <Radio className="h-3.5 w-3.5" />
            {lang === "zh" ? "社交聆听" : "Analyze"}
          </button>
          <button onClick={() => setView("alerts")}
            className={`rounded-md px-4 py-1.5 text-xs font-medium transition-colors inline-flex items-center gap-1.5 ${
              view === "alerts" ? "bg-brand-500/10 text-brand-500" : "text-surface-400 hover:text-surface-200"
            }`}>
            <Bell className="h-3.5 w-3.5" />
            Smart Alerts
          </button>
        </nav>
      </header>

      {/* Content */}
      {view === "analyze" ? (
        <SocialListening onSwitchToAlerts={switchToAlerts} />
      ) : (
        <SmartAlerts initialQuery={alertQuery} onCreated={handleAlertCreated} />
      )}

      {/* Footer */}
      <footer className="mt-12 text-center">
        <p className="text-[10px] font-mono text-surface-600">{t("footer", lang)}</p>
      </footer>
    </div>
  );
}
