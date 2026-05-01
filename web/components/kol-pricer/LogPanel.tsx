"use client";

import { useEffect, useRef } from "react";
import { LogEntry } from "@/lib/kol-pricer/types";
import { useLang } from "@/lib/use-lang";

interface LogPanelProps {
  logs: LogEntry[];
}

export default function LogPanel({ logs }: LogPanelProps) {
  const lang = useLang();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  if (logs.length === 0) return null;

  return (
    <div className="rounded-xl border border-surface-800 bg-surface-900 p-4">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-surface-400">
        <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-brand" />
        {lang === 'zh' ? '分析日志' : 'Analysis Log'}
      </h3>
      <div className="log-panel max-h-48 space-y-1.5 overflow-y-auto font-mono text-xs">
        {logs.map((log, i) => (
          <div key={i} className="flex gap-2">
            <span className="shrink-0 text-surface-600">
              {new Date(log.timestamp).toLocaleTimeString()}
            </span>
            <span
              className={
                log.type === "success"
                  ? "text-brand"
                  : log.type === "error"
                  ? "text-red-400"
                  : "text-surface-300"
              }
            >
              {log.message}
            </span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
