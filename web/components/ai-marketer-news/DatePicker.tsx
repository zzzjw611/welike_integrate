"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  issues: string[];
  currentDate: string;
};

function formatShort(iso: string) {
  const d = new Date(iso + "T00:00:00");
  const month = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ][d.getMonth()];
  return `${month} ${d.getDate()}`;
}

function formatFull(iso: string) {
  const d = new Date(iso + "T00:00:00");
  const weekday = [
    "Sunday", "Monday", "Tuesday", "Wednesday",
    "Thursday", "Friday", "Saturday",
  ][d.getDay()];
  const month = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ][d.getMonth()];
  return `${weekday}, ${month} ${d.getDate()}, ${d.getFullYear()}`;
}

export default function DatePicker({ issues, currentDate }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }
  }, [open]);

  const currentIdx = issues.indexOf(currentDate);

  function goTo(date: string) {
    setOpen(false);
    router.push(`/tools/news/archive/${date}`);
  }

  return (
    <div ref={ref} className="relative flex-shrink-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-xl border border-surface-800 bg-surface-900/60 backdrop-blur-sm px-3.5 py-2.5 text-[12px] text-surface-300 hover:text-brand-500 hover:border-brand-500/40 transition-all font-medium"
      >
        <Calendar className="h-3.5 w-3.5" strokeWidth={1.75} />
        <span className="hidden sm:inline">{formatShort(currentDate)}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 z-50 w-72 rounded-xl border border-surface-800 bg-surface-900/95 backdrop-blur-xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-surface-800">
            <div className="text-[11px] uppercase tracking-widest text-surface-500 font-semibold">
              Browse Issues
            </div>
            <div className="text-[13px] text-white font-medium mt-0.5">
              {formatFull(currentDate)}
            </div>
          </div>

          {/* Issue list */}
          <div className="max-h-64 overflow-y-auto py-1">
            {issues.length === 0 ? (
              <div className="px-4 py-6 text-center text-[12px] text-surface-500">
                No issues available
              </div>
            ) : (
              issues.map((date, i) => {
                const isCurrent = date === currentDate;
                const d = new Date(date + "T00:00:00");
                const weekday = [
                  "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat",
                ][d.getDay()];
                const month = [
                  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
                  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
                ][d.getMonth()];
                const day = d.getDate();
                const label = `${weekday} · ${month} ${day}`;

                return (
                  <button
                    key={date}
                    type="button"
                    onClick={() => goTo(date)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                      isCurrent
                        ? "bg-brand-500/[0.08] text-brand-500"
                        : "text-surface-300 hover:bg-surface-800/60 hover:text-surface-100"
                    }`}
                  >
                    <span className="text-[11px] font-mono font-bold w-6 flex-shrink-0 text-surface-500">
                      {String(issues.length - i).padStart(2, "0")}
                    </span>
                    <span className="text-[12.5px] font-medium">{label}</span>
                    {isCurrent && (
                      <span className="ml-auto text-[9px] uppercase tracking-widest text-brand-500 font-semibold border border-brand-500/30 rounded-md px-1.5 py-0.5 bg-brand-500/10">
                        Now
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Quick nav */}
          <div className="flex items-center border-t border-surface-800 px-2 py-2">
            <button
              type="button"
              disabled={currentIdx >= issues.length - 1}
              onClick={() => {
                if (currentIdx < issues.length - 1) {
                  goTo(issues[currentIdx + 1]);
                }
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] text-surface-400 hover:text-surface-200 hover:bg-surface-800/60 transition-colors disabled:opacity-30 disabled:cursor-not-allowed font-medium"
            >
              <ChevronLeft className="h-3 w-3" strokeWidth={2} />
              <span>Older</span>
            </button>
            <button
              type="button"
              disabled={currentIdx <= 0}
              onClick={() => {
                if (currentIdx > 0) {
                  goTo(issues[currentIdx - 1]);
                }
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] text-surface-400 hover:text-surface-200 hover:bg-surface-800/60 transition-colors disabled:opacity-30 disabled:cursor-not-allowed font-medium ml-auto"
            >
              <span>Newer</span>
              <ChevronRight className="h-3 w-3" strokeWidth={2} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
