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
    <div className="min-h-screen -mt-8 relative">
      {/* ===== Ambient background layers ===== */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="pixel-grid" />
        <div
          className="big-ribbon-glow absolute -left-20 -top-10 h-[400px] w-[600px] rounded-full"
          style={{
            background: "radial-gradient(ellipse at 30% 50%, rgba(6,245,183,0.10), transparent 70%)",
            filter: "blur(80px)",
          }}
        />
        <div
          className="big-ribbon-band absolute -right-32 top-20 h-[350px] w-[500px] rounded-full"
          style={{
            background: "radial-gradient(ellipse at 70% 50%, rgba(255,255,255,0.03), transparent 70%)",
            filter: "blur(60px)",
          }}
        />
        <div
          className="big-ribbon-signal absolute left-1/4 bottom-10 h-[300px] w-[500px] rounded-full"
          style={{
            background: "radial-gradient(ellipse at 50% 50%, rgba(6,245,183,0.05), transparent 70%)",
            filter: "blur(100px)",
          }}
        />
        <div className="drift-particle-1 absolute left-[10%] top-[15%] h-4 w-4 rounded-full bg-brand-500/50 shadow-[0_0_20px_rgba(6,245,183,0.5)]" />
        <div className="drift-particle-3 absolute right-[25%] top-[40%] h-3 w-3 rounded-full bg-white/35 shadow-[0_0_14px_rgba(255,255,255,0.25)]" />
        <div className="drift-particle-5 absolute left-[50%] bottom-[20%] h-5 w-5 rounded-full bg-brand-500/40 shadow-[0_0_28px_rgba(6,245,183,0.45)]" />

      </div>

      {/* Header */}
      <header className="flex items-center justify-between mb-6 relative z-10">
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
