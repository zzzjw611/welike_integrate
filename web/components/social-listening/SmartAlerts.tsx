"use client";

import { useState, useEffect, useCallback } from "react";
import { useLang } from "@/lib/use-lang";
import { t } from "@/components/social-listening/i18n";
import {
  Bell,
  BellOff,
  Loader2,
  Plus,
  Trash2,
  RefreshCw,
  ExternalLink,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Settings2,
  Zap,
  Activity,
  Globe,
  Signal,
  Radio,
} from "lucide-react";

// ===== Types =====
interface Alert {
  id: number;
  chat_id: number;
  handles: string[];
  keywords: string[];
  sentiment_filter: string;
  urgency_filter: string;
  digest_mode: boolean;
  active: boolean;
  created_at: string;
  last_run_at: string | null;
}

interface LinkStatus {
  linked: boolean;
  chat_id: number | null;
  expired: boolean;
}

// ===== Helpers =====
const SENTIMENT_OPTIONS = [
  { value: "all", zh: "全部", en: "All" },
  { value: "positive", zh: "积极", en: "Positive" },
  { value: "negative", zh: "消极", en: "Negative" },
  { value: "neutral", zh: "中性", en: "Neutral" },
];

const URGENCY_OPTIONS = [
  { value: "all", zh: "全部", en: "All" },
  { value: "high", zh: "🚨 高", en: "🚨 High" },
  { value: "medium", zh: "⚠️ 中", en: "⚠️ Medium" },
  { value: "low", zh: "🔵 低", en: "🔵 Low" },
];

function formatTime(iso: string | null, lang: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (lang === "en") {
    if (diff < 60000) return "just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)} min ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} h ago`;
  } else {
    if (diff < 60000) return "刚刚";
    if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`;
  }
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

interface SmartAlertsProps {
  initialQuery?: string;
  onCreated?: () => void;
}

export default function SmartAlerts({ initialQuery, onCreated }: SmartAlertsProps) {
  const lang = useLang();

  // ===== State =====
  const [linking, setLinking] = useState(false);
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [linkStatus, setLinkStatus] = useState<LinkStatus | null>(null);
  const [pollingLink, setPollingLink] = useState(false);
  const [chatId, setChatId] = useState<number | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loadingAlerts, setLoadingAlerts] = useState(false);

  // Create form
  const [showCreate, setShowCreate] = useState(false);
  const [handles, setHandles] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState("");
  const [sentimentFilter, setSentimentFilter] = useState("all");
  const [urgencyFilter, setUrgencyFilter] = useState("all");
  const [digestMode, setDigestMode] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  // Pre-fill from initialQuery
  useEffect(() => {
    if (initialQuery) {
      setShowCreate(true);
      // If it looks like a handle (@xxx), put it in handles
      if (initialQuery.startsWith("@")) {
        setHandles(initialQuery.replace("@", ""));
      } else {
        // Otherwise treat as keywords
        const words = initialQuery.split(/[,，\s]+/).filter(Boolean).slice(0, 3);
        setKeywords(words);
      }
    }
  }, [initialQuery]);

  // Preview
  const [showPreview, setShowPreview] = useState(true);

  // ===== Telegram Linking =====
  const startLinking = useCallback(async () => {
    setLinking(true);
    try {
      const resp = await fetch("/api/social-listening/alerts/link/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tz: Intl.DateTimeFormat().resolvedOptions().timeZone }),
      });
      if (!resp.ok) throw new Error(`${resp.status}`);
      const data = await resp.json();
      setLinkToken(data.token);
      if (data.deep_link) {
        window.open(data.deep_link, "_blank");
      }
      setPollingLink(true);
    } catch {
      setLinking(false);
      setPollingLink(false);
    }
  }, []);

  // Poll link status
  useEffect(() => {
    if (!pollingLink || !linkToken) return;
    const interval = setInterval(async () => {
      try {
        const resp = await fetch(`/api/social-listening/alerts/link/status?token=${linkToken}`);
        const data = await resp.json();
        setLinkStatus(data);
        if (data.linked && data.chat_id) {
          setChatId(data.chat_id);
          setPollingLink(false);
          setLinking(false);
          localStorage.setItem("sl_chat_id", String(data.chat_id));
        }
        if (data.expired) {
          setPollingLink(false);
          setLinking(false);
        }
      } catch {
        // retry
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [pollingLink, linkToken]);

  // Restore chat_id from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("sl_chat_id");
    if (stored) {
      setChatId(Number(stored));
    }
  }, []);

  // ===== Load Alerts =====
  const loadAlerts = useCallback(async () => {
    if (!chatId) return;
    setLoadingAlerts(true);
    try {
      const resp = await fetch(`/api/social-listening/alerts/me?chat_id=${chatId}`);
      if (resp.ok) {
        const data = await resp.json();
        setAlerts(data.alerts || []);
      }
    } catch {
      // ignore
    }
    setLoadingAlerts(false);
  }, [chatId]);

  useEffect(() => {
    if (chatId) loadAlerts();
  }, [chatId, loadAlerts]);

  // ===== Create Alert =====
  const createAlert = useCallback(async () => {
    if (!chatId) return;
    setCreating(true);
    setCreateError("");
    try {
      const resp = await fetch("/api/social-listening/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          handles: handles.split(",").map((h) => h.trim()).filter(Boolean),
          keywords,
          sentiment_filter: sentimentFilter,
          urgency_filter: urgencyFilter,
          digest_mode: digestMode,
        }),
      });
      if (!resp.ok) {
        const err = await resp.json();
        throw new Error(
          err.detail || err.error || (lang === "zh" ? "创建失败" : "Creation failed")
        );
      }
      await loadAlerts();
      setShowCreate(false);
      setHandles("");
      setKeywords([]);
      setSentimentFilter("all");
      setUrgencyFilter("all");
      setDigestMode(false);
    } catch (err: any) {
      setCreateError(err.message);
    }
    setCreating(false);
  }, [chatId, handles, keywords, sentimentFilter, urgencyFilter, digestMode, loadAlerts]);

  // ===== Delete Alert =====
  const deleteAlert = useCallback(async (alertId: number) => {
    if (!chatId) return;
    try {
      await fetch(`/api/social-listening/alerts/${alertId}?chat_id=${chatId}`, {
        method: "DELETE",
      });
      setAlerts((prev) => prev.filter((a) => a.id !== alertId));
    } catch {
      // ignore
    }
  }, [chatId]);

  // ===== Toggle Alert Active =====
  const toggleAlert = useCallback(async (alert: Alert) => {
    if (!chatId) return;
    try {
      const resp = await fetch(`/api/social-listening/alerts/${alert.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, active: !alert.active }),
      });
      if (resp.ok) {
        setAlerts((prev) =>
          prev.map((a) => (a.id === alert.id ? { ...a, active: !a.active } : a))
        );
      }
    } catch {
      // ignore
    }
  }, [chatId]);

  // ===== Run Alert Now =====
  const runAlertNow = useCallback(async (alertId: number) => {
    if (!chatId) return;
    try {
      await fetch(`/api/social-listening/alerts/${alertId}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId }),
      });
    } catch {
      // ignore
    }
  }, [chatId]);

  // ===== Disconnect =====
  const disconnect = useCallback(() => {
    setChatId(null);
    setAlerts([]);
    localStorage.removeItem("sl_chat_id");
  }, []);

  // ===== Add keyword =====
  const addKeyword = useCallback(() => {
    const kw = keywordInput.trim();
    if (kw && !keywords.includes(kw) && keywords.length < 3) {
      setKeywords((prev) => [...prev, kw]);
      setKeywordInput("");
    }
  }, [keywordInput, keywords]);

  const removeKeyword = useCallback((kw: string) => {
    setKeywords((prev) => prev.filter((k) => k !== kw));
  }, []);

  // ===== Preview data =====
  const previewHandles = handles.trim() || "@WeLike";
  const previewKeywords = keywords.length > 0 ? keywords.join(", ") : null;

  return (
    <div className="space-y-6">
      {/* ===== System Status Bar ===== */}
      <div className="flex items-center justify-between rounded-lg border border-surface-800 bg-surface-900/80 px-4 py-2">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${chatId ? 'bg-brand-500 shadow-[0_0_6px_rgba(6,245,183,0.5)]' : 'bg-surface-600'} `} />
            <span className="text-[10px] font-mono text-brand-500 uppercase tracking-wider">ALERT STATUS</span>
          </div>
          <div className="hidden sm:flex items-center gap-3 text-[10px] font-mono text-surface-500">
            <span className="flex items-center gap-1">
              <Activity className="h-3 w-3 text-surface-600" />
              {chatId
                ? (lang === "zh" ? "Telegram 已连接" : "Telegram connected")
                : (lang === "zh" ? "等待连接" : "Awaiting connection")}
            </span>
            <span className="text-surface-700">|</span>
            <span className="flex items-center gap-1">
              <Globe className="h-3 w-3 text-surface-600" />
              {lang === "zh" ? `${alerts.length} 个监听` : `${alerts.length} alerts`}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`h-1.5 w-1.5 rounded-full ${chatId ? 'bg-brand-500 animate-pulse' : 'bg-surface-600'}`} />
          <span className="text-[10px] font-mono text-surface-600">
            {chatId
              ? (lang === "zh" ? "监控运行中" : "Monitoring active")
              : (lang === "zh" ? "离线" : "Offline")}
          </span>
        </div>
      </div>

      {/* ===== Hero ===== */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-brand-500/20 bg-brand-500/5 px-4 py-1.5 mb-4">
          <Bell className="h-3.5 w-3.5 text-brand-500" />
          <span className="text-[11px] font-mono tracking-wider text-brand-500 uppercase">
            {t("alerts_eyebrow", lang)}
          </span>
        </div>
        <h1 className="text-2xl font-bold text-white mb-3">
          <span className="text-brand-500">{t("alerts_title_em", lang)}</span>{" "}
          <span>{t("alerts_title_rest", lang)}</span>
        </h1>
        <p className="text-surface-400 text-sm max-w-2xl mx-auto mb-6">
          {t("alerts_desc", lang)}
        </p>
      </div>

      {/* ===== Telegram Connection ===== */}
      {!chatId ? (
        <div className="max-w-md mx-auto">
          {linking ? (
            <div className="rounded-xl border border-surface-800 bg-surface-900 p-8 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-brand-500 mx-auto mb-4" />
              <h3 className="text-base font-semibold text-white mb-2">
                {t("linking_title", lang)}
              </h3>
              <p className="text-xs text-surface-500 mb-4">
                {t("linking_desc", lang)}
              </p>
              {linkStatus?.linked ? (
                <div className="flex items-center justify-center gap-2 text-brand-500 text-sm">
                  <Check className="h-4 w-4" />
                  {t("link_connected_prefix", lang)} {linkStatus.chat_id}
                </div>
              ) : (
                <>
                  <a
                    href={`https://t.me/${linkStatus?.chat_id ? "bot" : ""}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-brand-500 hover:text-brand-400 transition-colors inline-flex items-center gap-1 mb-4"
                  >
                    {t("linking_open", lang)}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                  <button
                    onClick={() => { setLinking(false); setPollingLink(false); }}
                    className="block mx-auto rounded-lg border border-surface-700 bg-surface-900 px-4 py-2 text-xs text-surface-400 hover:text-white transition-colors"
                  >
                    {t("linking_cancel", lang)}
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="rounded-xl border border-surface-800 bg-surface-900 p-8 text-center">
              <div className="flex justify-center mb-6">
                <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-brand-500/20 to-brand-500/5 border border-brand-500/10 flex items-center justify-center">
                  <MessageSquare className="h-8 w-8 text-brand-500" />
                </div>
              </div>
              <h3 className="text-base font-semibold text-white mb-2">
                {t("connect_title", lang)}
              </h3>
              <p className="text-xs text-surface-500 mb-6">
                {t("connect_desc", lang)}
              </p>
              <button
                onClick={startLinking}
                className="rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-semibold text-black hover:bg-brand-400 transition-colors inline-flex items-center gap-2"
              >
                <MessageSquare className="h-4 w-4" />
                {t("connect_btn", lang)}
              </button>
            </div>
          )}
        </div>
      ) : (
        /* ===== Connected State ===== */
        <div className="space-y-6">
          {/* Connection status bar */}
          <div className="rounded-xl border border-brand-500/20 bg-gradient-to-br from-brand-500/10 to-brand-500/5 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-brand-500/20 flex items-center justify-center">
                <Check className="h-4 w-4 text-brand-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">
                  {t("link_connected_prefix", lang)} Telegram
                </p>
                <p className="text-[11px] font-mono text-surface-500">
                  Chat ID: {chatId}
                </p>
              </div>
            </div>
            <button
              onClick={disconnect}
              className="rounded-lg border border-surface-700 bg-surface-900 px-3 py-1.5 text-xs text-surface-400 hover:text-red-400 hover:border-red-500/20 transition-colors"
            >
              {t("link_disconnect", lang)}
            </button>
          </div>

          {/* ===== Create Alert Form ===== */}
          <div className="rounded-xl border border-surface-800 bg-surface-900 overflow-hidden">
            <button
              onClick={() => setShowCreate(!showCreate)}
              className="w-full flex items-center justify-between p-5 hover:bg-surface-800/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-brand-500/10 flex items-center justify-center">
                  <Plus className="h-4 w-4 text-brand-500" />
                </div>
                <span className="text-sm font-semibold text-white">
                  {t("alerts_create_title", lang)}
                </span>
              </div>
              {showCreate ? (
                <ChevronUp className="h-4 w-4 text-surface-500" />
              ) : (
                <ChevronDown className="h-4 w-4 text-surface-500" />
              )}
            </button>

            {showCreate && (
              <div className="px-5 pb-5 space-y-5 border-t border-surface-800 pt-5">
                {/* Handles */}
                <div>
                  <label className="text-xs font-medium text-surface-300 mb-1.5 block">
                    {t("alerts_label_handles", lang)}
                  </label>
                  <input
                    value={handles}
                    onChange={(e) => setHandles(e.target.value)}
                    placeholder={t("alerts_handles_ph", lang)}
                    className="w-full rounded-lg border border-surface-700 bg-surface-950 px-4 py-2.5 text-sm text-white placeholder:text-surface-500 focus-brand transition-colors"
                  />
                </div>

                {/* Keywords */}
                <div>
                  <label className="text-xs font-medium text-surface-300 mb-1.5 block">
                    {t("alerts_label_keywords", lang)}{" "}
                    <span className="text-surface-500 font-normal">
                      {t("alerts_optional", lang)} {t("alerts_keywords_max", lang)}
                    </span>
                  </label>
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    {keywords.map((kw) => (
                      <span
                        key={kw}
                        className="inline-flex items-center gap-1 rounded-md bg-brand-500/10 border border-brand-500/20 px-2 py-1 text-xs text-brand-500"
                      >
                        {kw}
                        <button onClick={() => removeKeyword(kw)} className="hover:text-white transition-colors">
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      value={keywordInput}
                      onChange={(e) => setKeywordInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          addKeyword();
                        }
                      }}
                      placeholder={t("alerts_keywords_ph", lang)}
                      disabled={keywords.length >= 3}
                      className="flex-1 rounded-lg border border-surface-700 bg-surface-950 px-4 py-2.5 text-sm text-white placeholder:text-surface-500 focus-brand transition-colors disabled:opacity-50"
                    />
                    <button
                      onClick={addKeyword}
                      disabled={!keywordInput.trim() || keywords.length >= 3}
                      className="rounded-lg border border-surface-700 bg-surface-900 px-3 py-2.5 text-xs text-surface-400 hover:text-white disabled:opacity-50 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Filters row */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Sentiment */}
                  <div>
                    <label className="text-xs font-medium text-surface-300 mb-1.5 block">
                      {t("alerts_label_filter", lang)}{" "}
                      <span className="text-surface-500 font-normal">
                        {t("alerts_filter_multi_hint", lang)}
                      </span>
                    </label>
                    <select
                      value={sentimentFilter}
                      onChange={(e) => setSentimentFilter(e.target.value)}
                      className="w-full rounded-lg border border-surface-700 bg-surface-950 px-4 py-2.5 text-sm text-white focus-brand transition-colors appearance-none cursor-pointer"
                    >
                      {SENTIMENT_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {lang === "zh" ? opt.zh : opt.en}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Urgency */}
                  <div>
                    <label className="text-xs font-medium text-surface-300 mb-1.5 block">
                      {t("alerts_label_urgency", lang)}
                    </label>
                    <select
                      value={urgencyFilter}
                      onChange={(e) => setUrgencyFilter(e.target.value)}
                      className="w-full rounded-lg border border-surface-700 bg-surface-950 px-4 py-2.5 text-sm text-white focus-brand transition-colors appearance-none cursor-pointer"
                    >
                      {URGENCY_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {lang === "zh" ? opt.zh : opt.en}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Digest mode */}
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => setDigestMode(!digestMode)}
                    className={`mt-0.5 h-5 w-9 rounded-full transition-colors relative flex-shrink-0 ${
                      digestMode ? "bg-brand-500" : "bg-surface-700"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
                        digestMode ? "translate-x-4" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                  <div>
                    <label className="text-xs font-medium text-surface-300 block mb-0.5">
                      {t("alerts_label_digest", lang)}
                    </label>
                    <p className="text-[11px] text-surface-500">
                      {t("alerts_digest_hint_short", lang)}
                    </p>
                  </div>
                </div>

                {/* Error */}
                {createError && (
                  <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-400">
                    {createError}
                  </div>
                )}

                {/* Submit */}
                <button
                  onClick={createAlert}
                  disabled={creating || (!handles.trim() && keywords.length === 0)}
                  className="w-full rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-semibold text-black hover:bg-brand-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center justify-center gap-2"
                >
                  {creating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Zap className="h-4 w-4" />
                  )}
                  {t("alerts_btn_create", lang)}
                </button>
              </div>
            )}
          </div>

          {/* ===== Active Alerts ===== */}
          <div className="rounded-xl border border-surface-800 bg-surface-900 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">
                {t("alerts_active", lang)}
                {alerts.length > 0 && (
                  <span className="ml-2 text-[11px] font-mono text-surface-500 font-normal">
                    ({alerts.length})
                  </span>
                )}
              </h3>
              <button
                onClick={loadAlerts}
                disabled={loadingAlerts}
                className="rounded-lg border border-surface-700 bg-surface-900 px-3 py-1.5 text-xs text-surface-400 hover:text-white disabled:opacity-50 transition-colors inline-flex items-center gap-1"
              >
                <RefreshCw className={`h-3 w-3 ${loadingAlerts ? "animate-spin" : ""}`} />
                {t("alerts_btn_refresh", lang)}
              </button>
            </div>

            {loadingAlerts ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-surface-500" />
              </div>
            ) : alerts.length === 0 ? (
              <div className="text-center py-8">
                <BellOff className="h-8 w-8 text-surface-600 mx-auto mb-3" />
                <p className="text-xs text-surface-500">
                  {lang === "zh" ? "还没有创建任何监听" : "No alerts created yet"}
                </p>
                <button
                  onClick={() => setShowCreate(true)}
                  className="mt-3 rounded-lg border border-surface-700 bg-surface-900 px-4 py-2 text-xs text-surface-400 hover:text-white transition-colors inline-flex items-center gap-1"
                >
                  <Plus className="h-3 w-3" />
                  {t("alerts_btn_create_alert", lang)}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`rounded-lg border p-4 transition-colors ${
                      alert.active
                        ? "border-surface-700 bg-surface-950"
                        : "border-surface-800 bg-surface-950/50 opacity-60"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        {/* Handles */}
                        {alert.handles.length > 0 && (
                          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                            {alert.handles.map((h) => (
                              <span
                                key={h}
                                className="inline-flex items-center rounded-md bg-brand-500/10 px-2 py-0.5 text-xs text-brand-500 font-mono"
                              >
                                @{h}
                              </span>
                            ))}
                          </div>
                        )}
                        {/* Keywords */}
                        {alert.keywords.length > 0 && (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {alert.keywords.map((kw) => (
                              <span
                                key={kw}
                                className="inline-flex items-center rounded-md bg-surface-800 px-2 py-0.5 text-xs text-surface-300"
                              >
                                {kw}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1 ml-3 flex-shrink-0">
                        <button
                          onClick={() => toggleAlert(alert)}
                          className={`rounded-lg p-2 transition-colors ${
                            alert.active
                              ? "text-brand-500 hover:bg-brand-500/10"
                              : "text-surface-500 hover:text-surface-300 hover:bg-surface-800"
                          }`}
                          title={alert.active ? "Pause" : "Activate"}
                        >
                          {alert.active ? (
                            <Bell className="h-3.5 w-3.5" />
                          ) : (
                            <BellOff className="h-3.5 w-3.5" />
                          )}
                        </button>
                        <button
                          onClick={() => runAlertNow(alert.id)}
                          className="rounded-lg p-2 text-surface-500 hover:text-surface-300 hover:bg-surface-800 transition-colors"
                          title="Run now"
                        >
                          <RefreshCw className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => deleteAlert(alert.id)}
                          className="rounded-lg p-2 text-surface-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Filters info */}
                    <div className="flex items-center gap-3 text-[11px] text-surface-500">
                      <span>
                        {lang === "zh" ? "情感" : "Sentiment"}:{" "}
                        <span className="text-surface-300">
                          {SENTIMENT_OPTIONS.find((o) => o.value === alert.sentiment_filter)
                            ? lang === "zh"
                              ? SENTIMENT_OPTIONS.find((o) => o.value === alert.sentiment_filter)?.zh
                              : SENTIMENT_OPTIONS.find((o) => o.value === alert.sentiment_filter)?.en
                            : alert.sentiment_filter}
                        </span>
                      </span>
                      <span className="text-surface-700">|</span>
                      <span>
                        {lang === "zh" ? "紧急度" : "Urgency"}:{" "}
                        <span className="text-surface-300">
                          {URGENCY_OPTIONS.find((o) => o.value === alert.urgency_filter)
                            ? lang === "zh"
                              ? URGENCY_OPTIONS.find((o) => o.value === alert.urgency_filter)?.zh
                              : URGENCY_OPTIONS.find((o) => o.value === alert.urgency_filter)?.en
                            : alert.urgency_filter}
                        </span>
                      </span>
                      {alert.digest_mode && (
                        <>
                          <span className="text-surface-700">|</span>
                          <span className="text-brand-500">
                            {lang === "zh" ? "聚合模式" : "Digest"}
                          </span>
                        </>
                      )}
                      <span className="ml-auto">
                        {lang === "zh" ? "上次运行" : "Last run"}: {formatTime(alert.last_run_at, lang)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ===== Live Preview ===== */}
          <div className="rounded-xl border border-surface-800 bg-surface-900 overflow-hidden">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="w-full flex items-center justify-between p-5 hover:bg-surface-800/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-surface-800 flex items-center justify-center">
                  <MessageSquare className="h-4 w-4 text-surface-400" />
                </div>
                <span className="text-sm font-semibold text-white">
                  {t("alerts_preview_label", lang)}
                </span>
              </div>
              {showPreview ? (
                <ChevronUp className="h-4 w-4 text-surface-500" />
              ) : (
                <ChevronDown className="h-4 w-4 text-surface-500" />
              )}
            </button>

            {showPreview && (
              <div className="px-5 pb-5 border-t border-surface-800 pt-5">
                {/* Telegram message mock */}
                <div className="max-w-sm mx-auto rounded-xl border border-surface-700 bg-surface-950 overflow-hidden">
                  {/* Header */}
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-surface-800">
                    <div className="h-6 w-6 rounded-full bg-brand-500/20 flex items-center justify-center">
                      <MessageSquare className="h-3 w-3 text-brand-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-white">WeLike Bot</span>
                        <span className="text-[10px] text-brand-500">● {t("alerts_preview_bot_status", lang)}</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-surface-500">{t("alerts_preview_time", lang)}</span>
                  </div>

                  {/* Body */}
                  <div className="px-4 py-3 space-y-2">
                    <div className="flex items-center gap-2 text-[11px] text-surface-400">
                      <Bell className="h-3 w-3 text-brand-500" />
                      <span className="font-mono">
                        {previewHandles}
                      </span>
                      <span>{t("alerts_preview_new_mention", lang)}</span>
                    </div>

                    {previewKeywords && (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {keywords.map((kw) => (
                          <span
                            key={kw}
                            className="inline-flex items-center rounded-md bg-surface-800 px-1.5 py-0.5 text-[10px] text-surface-400"
                          >
                            {kw}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="rounded-lg bg-surface-900 p-3 border border-surface-800">
                      <p className="text-xs text-surface-300 leading-relaxed">
                        {lang === "zh"
                          ? `"这个产品真的太棒了，强烈推荐！" — 来自 @user`
                          : `"This product is amazing, highly recommend!" — by @user`}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-surface-500">
                      <span className="inline-flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
                        {lang === "zh" ? "积极" : "Positive"}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-yellow-400" />
                        {lang === "zh" ? "高紧急度" : "High urgency"}
                      </span>
                    </div>

                    <div className="flex items-start gap-2 text-[11px] text-surface-400 border-t border-surface-800 pt-2">
                      <span className="text-brand-500 mt-0.5">📌</span>
                      <span>{t("alerts_preview_summary", lang)}</span>
                    </div>
                  </div>
                </div>

                {!handles.trim() && keywords.length === 0 && (
                  <p className="text-center text-[11px] text-surface-500 mt-4">
                    {t("alerts_preview_hint", lang)}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
