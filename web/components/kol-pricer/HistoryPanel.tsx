"use client";

import { HistoryItem } from "@/lib/kol-pricer/types";
import { useLang } from "@/lib/use-lang";

interface Props {
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
}

export default function HistoryPanel({ history, onSelect }: Props) {
  const lang = useLang();

  if (history.length === 0) return null;

  return (
    <div className="rounded-xl border border-surface-800 bg-surface-900 p-4">
      <h3 className="mb-3 text-sm font-medium text-surface-400">
        {lang === 'zh' ? '最近分析' : 'Recent Analyses'}
      </h3>
      <div className="space-y-2">
        {history.map((item, i) => (
          <button
            key={i}
            onClick={() => onSelect(item)}
            className="flex w-full items-center justify-between rounded-xl bg-surface-800/50 px-4 py-3 text-left transition-colors hover:bg-surface-800"
          >
            <div>
              <p className="text-sm font-medium text-white">
                @{item.handle}
              </p>
              <p className="text-xs text-surface-500">
                {new Date(item.timestamp).toLocaleString()}
              </p>
            </div>
            <span className="font-mono text-sm font-semibold text-brand">
              ${item.result.pricing.price.toLocaleString()}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
