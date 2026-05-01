"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useLang } from "@/lib/use-lang";
import { Search, Radio, Send, Loader2, MessageSquare, ChevronRight, Bell, Plus, Activity, Zap, Globe } from "lucide-react";
import { DoughnutChart, BarChart } from "@/components/social-listening/charts";
import { TweetCard } from "@/components/social-listening/TweetCard";
import {
  t, catLabel, urgLabel, actionLabel, CATEGORY_COLORS, FILTERS, EXAMPLES,
} from "@/components/social-listening/i18n";

// ===== Types =====
interface Tweet {
  text: string; author_username: string; author_followers?: number; author_verified?: boolean;
  sentiment: "positive" | "negative" | "neutral"; category: string; urgency: "high" | "medium" | "low";
  action: string; tweet_type: string; summary?: string; engagement?: number; replies?: number;
  retweets?: number; likes?: number; bookmarks?: number; impressions?: number; lang?: string; url?: string; created_at?: string;
}
interface Topic { topic: string; sentiment: string; urgency: string; action: string; tweet_ids?: number[]; count?: number; }
interface AnalysisResult {
  query: string; time_range: string; tweet_count: number;
  sentiment_counts: { positive: number; negative: number; neutral: number };
  category_counts: Record<string, number>; urgency_counts: { high?: number; medium?: number; low?: number };
  topics: Topic[]; tweets: Tweet[]; report_markdown: string; report_status: string;
}
interface ChatMessage { role: "user" | "assistant"; content: string; }

interface SocialListeningProps {
  onSwitchToAlerts?: (query: string) => void;
}

export default function SocialListening({ onSwitchToAlerts }: SocialListeningProps) {
  const lang = useLang();
  const [query, setQuery] = useState("");
  const [timeRange, setTimeRange] = useState("7d");
  const [taskId, setTaskId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMsg, setProgressMsg] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedTopicIdx, setSelectedTopicIdx] = useState(-1);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportMd, setReportMd] = useState("");
  const [timeline, setTimeline] = useState<any>(null);
  const [timelineLoading, setTimelineLoading] = useState(false);
  const [replyDraft, setReplyDraft] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);
  const [replyTweetIdx, setReplyTweetIdx] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { return () => { if (pollRef.current) clearInterval(pollRef.current); }; }, []);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatMessages]);

  const startAnalysis = useCallback(async () => {
    if (!query.trim()) return;
    setLoading(true); setError(""); setResult(null); setReportMd(""); setTimeline(null); setChatMessages([]);
    setProgress(5); setProgressMsg(t("progress_connecting", lang));
    try {
      const resp = await fetch("/api/social-listening/analyze", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query.trim(), time_range: timeRange }),
      });
      if (!resp.ok) throw new Error(`${resp.status}`);
      const data = await resp.json();
      setTaskId(data.task_id);
      startPolling(data.task_id);
    } catch (err: any) { setError(t("err_no_backend", lang) + ": " + err.message); setLoading(false); }
  }, [query, timeRange, lang]);

  const startPolling = useCallback((id: string) => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      try {
        const resp = await fetch(`/api/social-listening/status/${id}`);
        const data = await resp.json();
        setProgress(data.progress || 0); setProgressMsg(data.message || "");
        if (data.status === "done") { if (pollRef.current) clearInterval(pollRef.current); loadReport(id); }
        else if (data.status === "error") { if (pollRef.current) clearInterval(pollRef.current); setError(data.message || t("err_generic", lang)); setLoading(false); }
      } catch { if (pollRef.current) clearInterval(pollRef.current); setError(t("err_no_backend", lang)); setLoading(false); }
    }, 1200);
  }, [lang]);

  const loadReport = useCallback(async (id: string) => {
    try {
      const resp = await fetch(`/api/social-listening/report/${id}`);
      const data = await resp.json();
      setResult(data); setReportMd(data.report_markdown || ""); setLoading(false);
      if (data.time_range !== "24h") loadTimeline(id);
    } catch { setError(t("err_no_backend", lang)); setLoading(false); }
  }, [lang]);

  const loadTimeline = useCallback(async (id: string) => {
    setTimelineLoading(true);
    try { const resp = await fetch(`/api/social-listening/timeline/${id}`); const data = await resp.json(); setTimeline(data); } catch {}
    setTimelineLoading(false);
  }, []);

  const generateReport = useCallback(async () => {
    if (!taskId) return; setReportLoading(true);
    try {
      const resp = await fetch(`/api/social-listening/report/${taskId}/generate`, { method: "POST" });
      const data = await resp.json();
      if (data.report_markdown) setReportMd(data.report_markdown);
    } catch {}
    setReportLoading(false);
  }, [taskId]);

  const sendChat = useCallback(async () => {
    if (!chatInput.trim() || !taskId) return;
    const userMsg: ChatMessage = { role: "user", content: chatInput.trim() };
    setChatMessages((prev) => [...prev, userMsg]); setChatInput(""); setChatLoading(true);
    try {
      const resp = await fetch("/api/social-listening/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task_id: taskId, question: userMsg.content, history: chatMessages.slice(-10) }),
      });
      const data = await resp.json();
      setChatMessages((prev) => [...prev, { role: "assistant", content: data.answer || "(empty reply)" }]);
    } catch { setChatMessages((prev) => [...prev, { role: "assistant", content: "Error: failed to get response" }]); }
    setChatLoading(false);
  }, [chatInput, taskId, chatMessages]);

  const generateReply = useCallback(async (tweetIdx: number) => {
    if (!taskId) return;
    setReplyTweetIdx(tweetIdx); setReplyLoading(true); setReplyDraft("");
    try {
      const resp = await fetch("/api/social-listening/generate-reply", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task_id: taskId, tweet_index: tweetIdx, lang }),
      });
      const data = await resp.json();
      setReplyDraft(data.draft || "");
    } catch {}
    setReplyLoading(false);
  }, [taskId, lang]);

  const copyDraft = useCallback(() => { navigator.clipboard.writeText(replyDraft); setCopied(true); setTimeout(() => setCopied(false), 1500); }, [replyDraft]);
  const closeReply = useCallback(() => { setReplyTweetIdx(null); setReplyDraft(""); }, []);
  const chatSuggest = useCallback((prompt: string) => setChatInput(prompt), []);

  const filteredTweets = result?.tweets?.filter((t) => {
    if (filter === "all") return true;
    const [k, v] = filter.split(":");
    if (k === "cat") return t.category === v;
    if (k === "sent") return t.sentiment === v;
    return true;
  }) ?? [];

  const sentData = result ? [result.sentiment_counts.positive || 0, result.sentiment_counts.negative || 0, result.sentiment_counts.neutral || 0] : [0, 0, 0];
  const catKeys = ["key_voice", "feature_request", "bug_issue", "competitor", "general"];
  const catData = catKeys.map((k) => result?.category_counts?.[k] || 0);
  const selectedTopic = selectedTopicIdx >= 0 && result?.topics?.[selectedTopicIdx] ? result.topics[selectedTopicIdx] : null;

  function renderMarkdown(md: string) {
    if (!md) return null;
    const html = md
      .replace(/^### (.+)$/gm, '<h3 class="text-base font-semibold text-white mt-5 mb-2">$1</h3>')
      .replace(/^## (.+)$/gm, '<h2 class="text-lg font-bold text-brand-500 mt-6 mb-3">$1</h2>')
      .replace(/^# (.+)$/gm, '<h1 class="text-xl font-bold text-white mt-6 mb-3 border-b border-surface-800 pb-2">$1</h1>')
      .replace(/\*\*(.+?)\*\*/g, '<strong class="text-brand-500">$1</strong>')
      .replace(/^- (.+)$/gm, '<li class="text-sm text-surface-300 ml-4 mb-1">• $1</li>')
      .replace(/\n\n/g, '</p><p class="text-sm text-surface-300 mb-2">')
      .replace(/^([^<].+)$/gm, (m) => m.trim() ? `<p class="text-sm text-surface-300 mb-2">${m}</p>` : "");
    return <div className="text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: html }} />;
  }

  return (
    <div className="space-y-6">
      {/* ===== System Status Bar ===== */}
      <div className="flex items-center justify-between rounded-lg border border-surface-800 bg-surface-900/80 px-4 py-2">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-brand-500 shadow-[0_0_6px_rgba(6,245,183,0.5)]" />
            <span className="text-[10px] font-mono text-brand-500 uppercase tracking-wider">LIVE SIGNAL</span>
          </div>
          <div className="hidden sm:flex items-center gap-3 text-[10px] font-mono text-surface-500">
            <span className="flex items-center gap-1">
              <Activity className="h-3 w-3 text-surface-600" />
              {lang === "zh" ? "数据流待命" : "Data stream idle"}
            </span>
            <span className="text-surface-700">|</span>
            <span className="flex items-center gap-1">
              <Globe className="h-3 w-3 text-surface-600" />
              X API
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-surface-600 animate-pulse" />
          <span className="text-[10px] font-mono text-surface-600">{lang === "zh" ? "等待输入" : "Awaiting input"}</span>
        </div>
      </div>

      {/* Hero */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-brand-500/20 bg-brand-500/5 px-4 py-1.5 mb-4">
          <Radio className="h-3.5 w-3.5 text-brand-500" />
          <span className="text-[11px] font-mono tracking-wider text-brand-500 uppercase">{t("subtitle", lang)}</span>
        </div>
        <h1 className="text-2xl font-bold text-white mb-3">{t("title", lang)}</h1>
        <h2 className="text-lg font-semibold text-surface-200 mb-3" dangerouslySetInnerHTML={{ __html: t("hero_tagline", lang) }} />
        <p className="text-surface-400 text-sm max-w-2xl mx-auto mb-6">{t("desc", lang)}</p>
        <div className="max-w-2xl mx-auto">
          {/* Input panel with system labels */}
          <div className="rounded-xl border border-surface-800 bg-surface-900/80 overflow-hidden">
            {/* Panel header */}
            <div className="flex items-center gap-3 px-4 py-2 border-b border-surface-800 bg-surface-900/50">
              <span className="text-[10px] font-mono tracking-wider text-surface-500 uppercase">SOURCE INPUT</span>
              <span className="text-surface-700">|</span>
              <span className="text-[10px] font-mono tracking-wider text-surface-500 uppercase">MONITORING WINDOW</span>
            </div>
            {/* Input row */}
            <div className="flex items-center gap-2 p-2">
              <input value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && startAnalysis()}
                placeholder={t("search_placeholder", lang)} className="flex-1 bg-transparent border-none px-3 py-2.5 text-sm text-white placeholder:text-surface-500 outline-none" />
              <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)}
                className="bg-transparent border-l border-surface-700 text-surface-400 text-xs font-mono px-3 py-2 outline-none appearance-none cursor-pointer">
                <option value="24h">{t("time_24h", lang)}</option>
                <option value="7d">{t("time_7d", lang)}</option>
                <option value="14d">{t("time_14d", lang)}</option>
              </select>
              <button onClick={startAnalysis} disabled={loading || !query.trim()}
                className="flex items-center gap-2 rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-semibold text-black hover:bg-brand-400 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed transition-all relative overflow-hidden group">
                {/* Scan line effect on hover */}
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                {loading ? t("btn_analyzing", lang) : result ? t("btn_reanalyze", lang) : t("btn_analyze", lang)}
              </button>
            </div>
          </div>
          {/* Try chips — now prepend x.com/ */}
          <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
            <span className="text-[10px] font-mono text-surface-500 uppercase tracking-wider">{t("examples", lang)}</span>
            {EXAMPLES.map((ex) => (
              <button key={ex} onClick={() => setQuery(`https://x.com/${ex}`)}
                className="rounded-full border border-surface-700 px-3 py-1 text-[11px] font-mono text-surface-400 hover:border-brand-500 hover:text-brand-500 hover:bg-brand-500/5 active:scale-[0.95] transition-all">{ex}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
          <p>{error}</p>
          <button onClick={() => { setError(""); setLoading(false); }}
            className="mt-2 rounded-lg border border-surface-700 px-3 py-1.5 text-xs text-surface-300 hover:text-white transition-colors">{t("btn_search_again", lang)}</button>
        </div>
      )}

      {/* Progress */}
      {loading && !result && (
        <div className="max-w-xl mx-auto rounded-xl border border-surface-800 bg-surface-900 p-5">
          <div className="flex items-center gap-3 mb-3">
            <span className="h-2.5 w-2.5 rounded-full bg-brand-500 animate-pulse shadow-[0_0_8px_rgba(6,245,183,0.5)]" />
            <span className="text-sm text-white">{progressMsg || t("progress_init", lang)}</span>
          </div>
          <div className="h-1.5 rounded-full bg-surface-800 overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-brand-800 to-brand-500 transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
          <div className="text-right text-xs font-mono text-brand-500 mt-1.5">{progress}%</div>
        </div>
      )}

      {/* Dashboard */}
      {result && (
        <div className="space-y-5">
          {/* Stats */}
          <div className="grid grid-cols-5 gap-3">
            {[
              { label: t("stat_tweets", lang), value: result.tweet_count, color: "text-white" },
              { label: t("stat_pos", lang), value: Math.round((result.sentiment_counts.positive || 0) / Math.max(result.tweet_count, 1) * 100), color: "text-brand-500", suffix: "%" },
              { label: t("stat_neg", lang), value: Math.round((result.sentiment_counts.negative || 0) / Math.max(result.tweet_count, 1) * 100), color: "text-red-400", suffix: "%" },
              { label: t("stat_neu", lang), value: Math.round((result.sentiment_counts.neutral || 0) / Math.max(result.tweet_count, 1) * 100), color: "text-surface-400", suffix: "%" },
              { label: t("stat_urgent", lang), value: result.urgency_counts.high || 0, color: "text-yellow-400" },
            ].map((stat, i) => (
              <div key={i} className="rounded-xl border border-surface-800 bg-surface-900 p-4 relative overflow-hidden hover:border-surface-700 transition-colors">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 to-transparent opacity-0 hover:opacity-100 transition-opacity pointer-events-none" />
                <p className="text-[10px] font-mono tracking-wider text-surface-500 mb-2 relative">{stat.label}</p>
                <span className={`text-3xl font-bold ${stat.color} relative`}>{stat.value}</span>
                {stat.suffix && <span className="text-xs text-surface-500 ml-0.5 relative">{stat.suffix}</span>}
              </div>
            ))}
          </div>

          {/* Create Alert CTA */}
          {onSwitchToAlerts && (
            <div className="rounded-xl border border-brand-500/20 bg-gradient-to-br from-brand-500/10 to-brand-500/5 p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-brand-500/20 flex items-center justify-center">
                  <Bell className="h-5 w-5 text-brand-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    {lang === "zh" ? "实时捕捉，即刻决策" : "Real-time Capture, Instant Decisions"}
                  </p>
                  <p className="text-xs text-surface-400">
                    {lang === "zh"
                      ? `将 "${result.query}" 设为 Telegram 监听，新推文自动推送`
                      : `Set "${result.query}" as a Telegram alert — get notified on new tweets`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => onSwitchToAlerts(result.query)}
                className="rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-semibold text-black hover:bg-brand-400 transition-colors inline-flex items-center gap-2 flex-shrink-0"
              >
                <Plus className="h-4 w-4" />
                {lang === "zh" ? "创建 Alert" : "Create Alert"}
              </button>
            </div>
          )}

          {/* Charts */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-surface-800 bg-surface-900 p-5">
              <h3 className="text-sm font-semibold text-white mb-4">{t("card_sentiment", lang)}</h3>
              <div className="flex items-center gap-6">
                <DoughnutChart data={sentData} colors={["#06f5b7", "#ff5c7a", "#8b9aff"]} size={130} />
                <div className="space-y-2">
                  {[
                    { label: lang === "zh" ? "积极" : "Positive", value: sentData[0], color: "#06f5b7" },
                    { label: lang === "zh" ? "消极" : "Negative", value: sentData[1], color: "#ff5c7a" },
                    { label: lang === "zh" ? "中性" : "Neutral", value: sentData[2], color: "#8b9aff" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-xs text-surface-400">{item.label}</span>
                      <span className="text-xs font-mono text-surface-300 ml-auto">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-surface-800 bg-surface-900 p-5">
              <h3 className="text-sm font-semibold text-white mb-4">{t("card_categories", lang)}</h3>
              <BarChart data={catData} labels={catKeys.map((k) => catLabel(k, lang))} colors={catKeys.map((k) => CATEGORY_COLORS[k])} maxHeight={140} />
            </div>
          </div>

          {/* Timeline */}
          {result.time_range !== "24h" && (
            <div className="rounded-xl border border-surface-800 bg-surface-900 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-white">{t("timeline_title", lang)}</h3>
                <span className="text-[10px] font-mono text-surface-500">{t("timeline_hint", lang)}</span>
              </div>
              {timelineLoading ? (
                <div className="flex items-center justify-center py-8 text-surface-500 text-xs"><Loader2 className="h-4 w-4 animate-spin mr-2" />{t("timeline_loading", lang)}</div>
              ) : timeline?.buckets?.length ? (
                <div>
                  <BarChart data={timeline.buckets.map((b: any) => b.count || 0)}
                    labels={timeline.buckets.map((b: any) => { const d = new Date(b.date); return `${d.getMonth() + 1}/${d.getDate()}`; })}
                    colors={timeline.buckets.map(() => "#06f5b7")} maxHeight={120} />
                  {timeline.milestones?.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <p className="text-[10px] font-mono text-surface-500 uppercase tracking-wider">{t("milestone_label", lang)}</p>
                      {timeline.milestones.map((m: any, i: number) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-surface-400">
                          <span className="text-brand-500 mt-0.5">◆</span>
                          <div><span className="text-surface-300 font-medium">{m.date || m.label}</span><p className="text-surface-500">{m.description || m.event}</p></div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : <div className="text-center py-8 text-surface-500 text-xs">{t("timeline_empty", lang)}</div>}
            </div>
          )}

          {/* Topics */}
          <div className="rounded-xl border border-surface-800 bg-surface-900 p-5">
            <h3 className="text-sm font-semibold text-white mb-4">{t("card_topics", lang)}</h3>
            {result.topics?.length ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                  {result.topics.map((topic, idx) => (
                    <button key={idx} onClick={() => setSelectedTopicIdx(idx)}
                      className={`w-full text-left rounded-lg border p-3 transition-colors ${idx === selectedTopicIdx ? "border-brand-500/30 bg-brand-500/5" : "border-surface-800 bg-surface-950 hover:border-surface-700"}`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-white truncate">{topic.topic}</span>
                        <span className="text-[10px] font-mono text-surface-500 ml-2">{topic.count || topic.tweet_ids?.length || 0}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ backgroundColor: CATEGORY_COLORS[topic.sentiment] + "22", color: CATEGORY_COLORS[topic.sentiment] }}>{topic.sentiment}</span>
                        <span className="text-[10px] text-surface-500">{urgLabel(topic.urgency, lang)}</span>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="rounded-lg border border-surface-800 bg-surface-950 p-4 min-h-[200px]">
                  {selectedTopic ? (
                    <div>
                      <h4 className="text-sm font-semibold text-white mb-2">{selectedTopic.topic}</h4>
                      <p className="text-xs text-surface-400 mb-3">{t("topic_overall_advice", lang)} <span className="text-surface-300">{actionLabel(selectedTopic.action, lang)}</span></p>
                      <p className="text-[10px] font-mono text-surface-500">{selectedTopic.count || selectedTopic.tweet_ids?.length || 0} {t("topic_driving_tweets", lang)}</p>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-surface-500 text-xs">{t("topic_empty", lang)}</div>
                  )}
                </div>
              </div>
            ) : <div className="text-center py-8 text-surface-500 text-xs">{t("no_topics", lang)}</div>}
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            {FILTERS.map((f) => (
              <button key={f.key} onClick={() => setFilter(f.key)}
                className={`rounded-full px-3 py-1 text-[11px] font-mono transition-colors ${
                  filter === f.key ? "bg-brand-500/10 text-brand-500 border border-brand-500/30" : "text-surface-500 border border-surface-800 hover:text-surface-300"
                }`}>
                {lang === "zh" ? f.zh : f.en}
              </button>
            ))}
          </div>

          {/* Tweets */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-white">{t("card_raw_tweets", lang)} ({filteredTweets.length})</h3>
            {filteredTweets.length ? filteredTweets.map((tweet, idx) => (
              <TweetCard key={idx} tweet={tweet} idx={idx} lang={lang}
                replyLoading={replyLoading} replyTweetIdx={replyTweetIdx} replyDraft={replyDraft}
                onGenerateReply={generateReply} onCopyDraft={copyDraft} copied={copied} onCloseReply={closeReply} />
            )) : <div className="text-center py-8 text-surface-500 text-xs">{t("no_tweets", lang)}</div>}
          </div>

          {/* Report */}
          <div className="rounded-xl border border-surface-800 bg-surface-900 p-5">
            <h3 className="text-sm font-semibold text-white mb-4">{t("card_report", lang)}</h3>
            {reportMd ? (
              <div className="max-h-[600px] overflow-y-auto pr-2">{renderMarkdown(reportMd)}</div>
            ) : (
              <div className="text-center py-6">
                <p className="text-xs text-surface-500 mb-4">{t("report_empty", lang)}</p>
                <button onClick={generateReport} disabled={reportLoading}
                  className="rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-semibold text-black hover:bg-brand-400 disabled:opacity-50 transition-colors">
                  {reportLoading ? <><Loader2 className="h-4 w-4 animate-spin inline mr-2" />{t("generating", lang)}</> : t("generate_report", lang)}
                </button>
              </div>
            )}
          </div>

          {/* Chat */}
          <div className="rounded-xl border border-surface-800 bg-surface-900 p-5">
            <h3 className="text-sm font-semibold text-white mb-4">{t("card_chat", lang)}</h3>
            <div className="max-h-[400px] overflow-y-auto mb-4 space-y-3 pr-2">
              {chatMessages.length === 0 && (
                <div className="text-center py-6 text-surface-500 text-xs">{t("chat_empty_hint", lang)}</div>
              )}
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] rounded-lg px-4 py-2.5 text-sm ${
                    msg.role === "user" ? "bg-brand-500/10 text-brand-500 border border-brand-500/20" : "bg-surface-800 text-surface-300"
                  }`}>{msg.content}</div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="rounded-lg bg-surface-800 px-4 py-2.5 text-sm text-surface-500 flex items-center gap-2">
                    <Loader2 className="h-3 w-3 animate-spin" />{t("chat_thinking", lang)}
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            <div className="flex items-center gap-2">
              <input value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendChat()}
                placeholder={t("chat_placeholder", lang)}
                className="flex-1 rounded-lg border border-surface-700 bg-surface-950 px-4 py-2.5 text-sm text-white placeholder:text-surface-500 focus-brand outline-none transition-colors" />
              <button onClick={sendChat} disabled={chatLoading || !chatInput.trim() || !taskId}
                className="rounded-lg bg-brand-500 p-2.5 text-black hover:bg-brand-400 disabled:opacity-50 transition-colors">
                {chatLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </div>
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              {[
                { label: t("chat_suggest_3", lang), prompt: lang === "zh" ? "列出最需要立即回复的3条推文" : "List the top 3 tweets that need an immediate reply" },
                { label: t("chat_suggest_features", lang), prompt: lang === "zh" ? "总结所有功能建议" : "Summarize all feature requests" },
                { label: t("chat_suggest_neg", lang), prompt: lang === "zh" ? "分析负面反馈的根因" : "Analyze the root cause of negative feedback" },
                { label: t("chat_suggest_compare", lang), prompt: lang === "zh" ? "竞品对比分析" : "Competitor comparison analysis" },
              ].map((s, i) => (
                <button key={i} onClick={() => chatSuggest(s.prompt)}
                  className="rounded-full border border-surface-700 px-3 py-1 text-[10px] text-surface-500 hover:text-surface-300 hover:border-surface-600 transition-colors">{s.label}</button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
