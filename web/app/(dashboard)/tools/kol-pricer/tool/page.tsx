"use client";

import { useState, useCallback, FormEvent } from "react";
import { useLang } from "@/lib/use-lang";
import { AnalysisResult, LogEntry, HistoryItem } from "@/lib/kol-pricer/types";
import LogPanel from "@/components/kol-pricer/LogPanel";
import DataSummary from "@/components/kol-pricer/DataSummary";
import ScoreBreakdown from "@/components/kol-pricer/ScoreBreakdown";
import PriceCard from "@/components/kol-pricer/PriceCard";
import PriceRange from "@/components/kol-pricer/PriceRange";
import FormulaCard from "@/components/kol-pricer/FormulaCard";
import ClaudeInsightCard from "@/components/kol-pricer/ClaudeInsightCard";
import HistoryPanel from "@/components/kol-pricer/HistoryPanel";

export default function KolPricerPage() {
  const lang = useLang();
  const [handle, setHandle] = useState("");
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const analyze = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (!handle.trim() || loading) return;

      setLoading(true);
      setLogs([]);
      setResult(null);
      setError(null);

      try {
        const res = await fetch("/api/kol-pricer/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ handle: handle.trim() }),
        });

        if (res.status === 429) {
          setError(lang === 'zh' ? '请求频率超限，请稍等一分钟再试。' : "Rate limit exceeded. Please wait a minute and try again.");
          setLoading(false);
          return;
        }

        const reader = res.body?.getReader();
        if (!reader) {
          setError(lang === 'zh' ? '无法连接到分析流' : "Failed to connect to analysis stream");
          setLoading(false);
          return;
        }

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            const dataMatch = line.match(/^data: (.+)$/m);
            if (!dataMatch) continue;

            try {
              const parsed = JSON.parse(dataMatch[1]);
              if (parsed.type === "log") {
                setLogs((prev) => [...prev, parsed.log]);
              } else if (parsed.type === "result") {
                const analysisResult = parsed.data as AnalysisResult;
                setResult(analysisResult);
                setHistory((prev) => {
                  const newItem: HistoryItem = {
                    handle: handle.trim().replace(/^@/, ""),
                    result: analysisResult,
                    timestamp: new Date().toISOString(),
                  };
                  return [newItem, ...prev].slice(0, 10);
                });
              } else if (parsed.type === "error") {
                setError(parsed.error);
              }
            } catch {
              // skip malformed SSE data
            }
          }
        }
      } catch {
        setError(lang === 'zh' ? '网络错误，请检查连接后重试。' : "Network error. Please check your connection and try again.");
      } finally {
        setLoading(false);
      }
    },
    [handle, loading, lang]
  );

  const loadFromHistory = (item: HistoryItem) => {
    setHandle(item.handle);
    setResult(item.result);
    setError(null);
    setLogs([]);
  };

  return (
    <div className="flex flex-col items-center">
      <p className="mb-6 text-sm text-surface-400 text-center max-w-xl">
        {lang === 'zh' ? '输入 X 账号，计算预估的赞助推文价格。' : 'Enter an X handle to calculate the estimated sponsored tweet price.'}
      </p>

      {/* Search — centered */}
      <form onSubmit={analyze} className="mb-8 w-full max-w-xl">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-500">
              @
            </span>
            <input
              type="text"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              placeholder={lang === 'zh' ? '用户名 或 x.com/用户名' : 'username or x.com/username'}
              className="w-full rounded-xl border border-surface-700 bg-surface-900 py-3 pl-9 pr-4 font-mono text-white placeholder-surface-600 outline-none transition-colors focus-brand"
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={loading || !handle.trim()}
            className="rounded-xl bg-brand-500 px-6 py-3 font-medium text-black transition-all active:scale-[0.97] hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg
                  className="h-4 w-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="3"
                    className="opacity-25"
                  />
                  <path
                    d="M4 12a8 8 0 018-8"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
                {lang === 'zh' ? '分析中...' : 'Analyzing...'}
              </span>
            ) : (
              lang === 'zh' ? '分析' : 'Analyze'
            )}
          </button>
        </div>
      </form>

      {/* Error */}
      {error && (
        <div className="mb-6 w-full max-w-xl rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Log Panel */}
      {(loading || logs.length > 0) && (
        <div className="mb-8 w-full max-w-xl">
          <LogPanel logs={logs} />
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="w-full space-y-6">
          <DataSummary result={result} />
          <div className="grid gap-6 lg:grid-cols-2">
            <PriceCard pricing={result.pricing} domain={result.domain} />
            <ScoreBreakdown scores={result.scores} />
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <PriceRange pricing={result.pricing} />
            <FormulaCard
              pricing={result.pricing}
              domain={result.domain}
              claudeAnalysis={result.claudeAnalysis}
            />
          </div>
          {result.claudeAnalysis && (
            <ClaudeInsightCard analysis={result.claudeAnalysis} />
          )}
        </div>
      )}

      {/* History */}
      <div className="mt-8 w-full">
        <HistoryPanel history={history} onSelect={loadFromHistory} />
      </div>
    </div>
  );
}
