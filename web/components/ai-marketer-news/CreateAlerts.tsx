"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Bell,
  BellOff,
  Send,
  Check,
  Loader2,
  Mail,
  MessageCircle,
  Trash2,
  ExternalLink,
  Clock,
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react";

// ===== Types =====
type AlertChannel = "telegram" | "email";

interface AlertConfig {
  channel: AlertChannel;
  chatId?: number;
  email?: string;
  sections: {
    briefs: boolean;
    launches: boolean;
    growth_insights: boolean;
    daily_case: boolean;
  };
  deliveryTime: string; // HH:mm format, e.g. "09:00"
  timezone: string; // IANA timezone, e.g. "America/Los_Angeles"
  enabled: boolean;
}

interface LinkStatus {
  linked: boolean;
  chat_id: number | null;
  expired: boolean;
}

const STORAGE_KEY = "welike_news_alerts";

function loadConfig(): AlertConfig | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    // Migrate old configs that may be missing fields
    if (!parsed.sections) {
      parsed.sections = { ...DEFAULT_SECTIONS };
    }
    if (!parsed.deliveryTime) {
      parsed.deliveryTime = DEFAULT_TIME;
    }
    return parsed as AlertConfig;
  } catch {
    return null;
  }
}

function saveConfig(config: AlertConfig) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

function clearConfig() {
  localStorage.removeItem(STORAGE_KEY);
}

// ===== Default config =====
const DEFAULT_SECTIONS = {
  briefs: true,
  launches: true,
  growth_insights: true,
  daily_case: true,
};

const DEFAULT_TIME = "09:00";

// ===== Timezone list =====
const TIMEZONES = [
  { value: "America/Los_Angeles", label: "Pacific Time (US & Canada) — UTC-7/8" },
  { value: "America/Denver", label: "Mountain Time (US & Canada) — UTC-6/7" },
  { value: "America/Chicago", label: "Central Time (US & Canada) — UTC-5/6" },
  { value: "America/New_York", label: "Eastern Time (US & Canada) — UTC-4/5" },
  { value: "America/Sao_Paulo", label: "Brasília Time — UTC-3" },
  { value: "Europe/London", label: "Greenwich Mean Time (UK) — UTC+0/1" },
  { value: "Europe/Paris", label: "Central European Time — UTC+1/2" },
  { value: "Europe/Moscow", label: "Moscow Time — UTC+3" },
  { value: "Asia/Dubai", label: "Gulf Standard Time — UTC+4" },
  { value: "Asia/Kolkata", label: "India Standard Time — UTC+5:30" },
  { value: "Asia/Shanghai", label: "China Standard Time — UTC+8" },
  { value: "Asia/Tokyo", label: "Japan Standard Time — UTC+9" },
  { value: "Asia/Seoul", label: "Korea Standard Time — UTC+9" },
  { value: "Australia/Sydney", label: "Australian Eastern Time — UTC+10/11" },
  { value: "Pacific/Auckland", label: "New Zealand Time — UTC+12/13" },
];

function getDefaultTimezone(): string {
  if (typeof window === "undefined") return "America/Los_Angeles";
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return "America/Los_Angeles";
  }
}

// ===== Format helpers =====
function formatIssueForTelegram(
  issue: {
    date: string;
    briefs: { title: string; summary: string }[];
    launches: { product: string; company: string; summary: string }[];
    growth_insights: { author: string; quote: string }[];
    daily_case?: { company: string; title: string };
  },
  sections: AlertConfig["sections"]
): string {
  let text = `🤖 <b>AI Marketer News — ${issue.date}</b>\n\n`;

  if (sections.briefs && issue.briefs.length > 0) {
    text += `<b>📋 Daily Brief</b>\n`;
    issue.briefs.slice(0, 5).forEach((b) => {
      text += `• <b>${b.title}</b>\n  ${b.summary.slice(0, 120)}${b.summary.length > 120 ? "…" : ""}\n`;
    });
    text += "\n";
  }

  if (sections.launches && issue.launches.length > 0) {
    text += `<b>🚀 Launch Radar</b>\n`;
    issue.launches.slice(0, 3).forEach((l) => {
      text += `• ${l.product} (${l.company})\n  ${l.summary.slice(0, 100)}${l.summary.length > 100 ? "…" : ""}\n`;
    });
    text += "\n";
  }

  if (sections.growth_insights && issue.growth_insights.length > 0) {
    text += `<b>💡 Growth Insights</b>\n`;
    issue.growth_insights.slice(0, 2).forEach((g) => {
      text += `• "${g.quote.slice(0, 100)}${g.quote.length > 100 ? "…" : ""}" — ${g.author}\n`;
    });
    text += "\n";
  }

  if (sections.daily_case && issue.daily_case) {
    text += `<b>📊 Daily Case</b>\n`;
    text += `• ${issue.daily_case.company} — ${issue.daily_case.title}\n`;
  }

  text += `\n📖 <a href="https://ai-marketer-news.vercel.app/">Read full issue →</a>`;
  return text;
}

function formatIssueForEmail(
  issue: {
    date: string;
    briefs: { title: string; summary: string; source?: string; url?: string }[];
    launches: { product: string; company: string; summary: string; url?: string }[];
    growth_insights: { author: string; handle?: string; quote: string; url?: string }[];
    daily_case?: { company: string; title: string; deck?: string };
  },
  sections: AlertConfig["sections"]
): string {
  let html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="background:#0a0a0a;color:#e5e5e5;font-family:Inter,sans-serif;padding:24px;max-width:600px;margin:0 auto;">
  <div style="border-bottom:1px solid #262626;padding-bottom:16px;margin-bottom:24px;">
    <h1 style="font-size:20px;font-weight:700;margin:0;color:#06f5b7;">AI Marketer News</h1>
    <p style="font-size:13px;color:#737373;margin:4px 0 0;">${issue.date}</p>
  </div>`;

  if (sections.briefs && issue.briefs.length > 0) {
    html += `<h2 style="font-size:15px;font-weight:600;color:#c7c7c7;margin:0 0 12px;">📋 Daily Brief</h2>`;
    issue.briefs.slice(0, 5).forEach((b) => {
      html += `
    <div style="border:1px solid #262626;border-radius:8px;padding:12px;margin-bottom:8px;background:#1a1a1a;">
      <h3 style="font-size:13px;font-weight:600;margin:0 0 4px;color:#e5e5e5;">${b.title}</h3>
      <p style="font-size:12px;color:#9e9e9e;margin:0;line-height:1.5;">${b.summary}</p>
      ${b.source ? `<p style="font-size:11px;color:#737373;margin:6px 0 0;">— ${b.source}</p>` : ""}
    </div>`;
    });
  }

  if (sections.launches && issue.launches.length > 0) {
    html += `<h2 style="font-size:15px;font-weight:600;color:#c7c7c7;margin:20px 0 12px;">🚀 Launch Radar</h2>`;
    issue.launches.slice(0, 3).forEach((l) => {
      html += `
    <div style="border:1px solid #262626;border-radius:8px;padding:12px;margin-bottom:8px;background:#1a1a1a;">
      <h3 style="font-size:13px;font-weight:600;margin:0 0 4px;color:#e5e5e5;">${l.product} <span style="color:#737373;font-weight:400;">— ${l.company}</span></h3>
      <p style="font-size:12px;color:#9e9e9e;margin:0;line-height:1.5;">${l.summary}</p>
    </div>`;
    });
  }

  if (sections.growth_insights && issue.growth_insights.length > 0) {
    html += `<h2 style="font-size:15px;font-weight:600;color:#c7c7c7;margin:20px 0 12px;">💡 Growth Insights</h2>`;
    issue.growth_insights.slice(0, 2).forEach((g) => {
      html += `
    <div style="border-left:2px solid #06f5b7;padding-left:12px;margin-bottom:12px;">
      <p style="font-size:12px;color:#9e9e9e;margin:0;font-style:italic;line-height:1.5;">"${g.quote}"</p>
      <p style="font-size:11px;color:#737373;margin:4px 0 0;">— ${g.author}</p>
    </div>`;
    });
  }

  if (sections.daily_case && issue.daily_case) {
    html += `<h2 style="font-size:15px;font-weight:600;color:#c7c7c7;margin:20px 0 12px;">📊 Daily Case</h2>
    <div style="border:1px solid #262626;border-radius:8px;padding:12px;background:#1a1a1a;">
      <h3 style="font-size:13px;font-weight:600;margin:0 0 4px;color:#e5e5e5;">${issue.daily_case.company} — ${issue.daily_case.title}</h3>
    </div>`;
  }

  html += `
  <div style="border-top:1px solid #262626;padding-top:16px;margin-top:24px;">
    <a href="https://ai-marketer-news.vercel.app/" style="display:inline-block;background:#06f5b7;color:#000;text-decoration:none;font-size:12px;font-weight:600;padding:8px 16px;border-radius:8px;">Read full issue →</a>
  </div>
</body>
</html>`;
  return html;
}

// ===== Section labels =====
const SECTION_LABELS: { key: keyof AlertConfig["sections"]; label: string; desc: string }[] = [
  { key: "briefs", label: "Daily Brief", desc: "Top AI news stories" },
  { key: "launches", label: "Launch Radar", desc: "New product launches" },
  { key: "growth_insights", label: "Growth Insights", desc: "Expert growth advice" },
  { key: "daily_case", label: "Daily Case", desc: "Marketing case study" },
];

export default function CreateAlerts({
  issue,
}: {
  issue: {
    date: string;
    briefs: { title: string; summary: string; source?: string; url?: string }[];
    launches: { product: string; company: string; summary: string; url?: string }[];
    growth_insights: { author: string; handle?: string; quote: string; url?: string }[];
    daily_case?: { company: string; title: string; deck?: string };
  } | null;
}) {
  const [config, setConfig] = useState<AlertConfig | null>(null);
  const [channel, setChannel] = useState<AlertChannel>("telegram");

  // Telegram linking
  const [linking, setLinking] = useState(false);
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [linkStatus, setLinkStatus] = useState<LinkStatus | null>(null);
  const [pollingLink, setPollingLink] = useState(false);
  const [chatId, setChatId] = useState<number | null>(null);

  // Email
  const [email, setEmail] = useState("");

  // Sections & time
  const [sections, setSections] = useState<AlertConfig["sections"]>({ ...DEFAULT_SECTIONS });
  const [deliveryTime, setDeliveryTime] = useState(DEFAULT_TIME);
  const [timezone, setTimezone] = useState(getDefaultTimezone());

  // Send state
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  // Collapsible
  const [expanded, setExpanded] = useState(false);

  // ===== Load saved config =====
  useEffect(() => {
    const saved = loadConfig();
    if (saved) {
      setConfig(saved);
      setChannel(saved.channel);
      setSections(saved.sections || { ...DEFAULT_SECTIONS });
      setDeliveryTime(saved.deliveryTime || DEFAULT_TIME);
      setTimezone(saved.timezone || getDefaultTimezone());
      if (saved.channel === "telegram" && saved.chatId) {
        setChatId(saved.chatId);
      } else if (saved.channel === "email") {
        setEmail(saved.email || "");
      }
    }
  }, []);

  // Manual Chat ID input (fallback when backend is not available)
  const [manualChatId, setManualChatId] = useState("");
  const [showManual, setShowManual] = useState(false);

  // ===== Telegram Linking =====
  const startLinking = useCallback(async () => {
    setLinking(true);
    setError("");
    setShowManual(false);
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
      // Backend not available — show manual input directly
      setLinking(false);
      setShowManual(true);
      setManualChatId("");
      setError("Backend not available. Please enter your Chat ID manually.");
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
        }
        if (data.expired) {
          setPollingLink(false);
          setLinking(false);
          setError("Link expired. Please try again.");
        }
      } catch {
        // retry
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [pollingLink, linkToken]);

  const handleManualConnect = () => {
    const id = parseInt(manualChatId.trim());
    if (isNaN(id)) {
      setError("Please enter a valid numeric Chat ID");
      return;
    }
    setChatId(id);
    setManualChatId("");
    setError("");
  };

  // ===== Save =====
  const handleSave = () => {
    if (channel === "telegram" && !chatId) {
      setError("Please connect Telegram first");
      return;
    }
    if (channel === "email" && !email) {
      setError("Please enter an email address");
      return;
    }

    const newConfig: AlertConfig = {
      channel,
      enabled: true,
      sections,
      deliveryTime,
      timezone,
      ...(channel === "telegram" ? { chatId: chatId! } : { email }),
    };
    saveConfig(newConfig);
    setConfig(newConfig);
    setError("");
  };

  const handleDelete = () => {
    clearConfig();
    setConfig(null);
    setChatId(null);
    setEmail("");
    setSections({ ...DEFAULT_SECTIONS });
    setDeliveryTime(DEFAULT_TIME);
    setError("");
  };

  // ===== Send Now =====
  const handleSendNow = async () => {
    if (!issue || !config) return;
    setSending(true);
    setError("");
    setSent(false);

    const activeSections = config.sections || sections;

    try {
      if (config.channel === "telegram" && config.chatId) {
        const text = formatIssueForTelegram(issue, activeSections);
        const res = await fetch("/api/telegram", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token: "8732346171:AAFcGgXKofYzY-tsQwv9ZyNkrfeuKqyvSGs",
            chatId: String(config.chatId),
            text,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.description || "Failed to send Telegram message");
      } else if (config.channel === "email" && config.email) {
        const html = formatIssueForEmail(issue, activeSections);
        const res = await fetch("/api/news/send-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: config.email,
            subject: `AI Marketer News — ${issue.date}`,
            html,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to send email");
      }
      setSent(true);
      setTimeout(() => setSent(false), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to send");
    } finally {
      setSending(false);
    }
  };

  // ===== Toggle section =====
  const toggleSection = (key: keyof AlertConfig["sections"]) => {
    setSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // ===== Render =====
  const isConfigured = config?.enabled;

  return (
    <section className="mx-auto max-w-3xl px-6 pb-16">
      <div className="rounded-xl border border-surface-800 bg-surface-900/50 overflow-hidden">
        {/* Header */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between p-5 hover:bg-surface-800/30 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg border border-surface-700 bg-surface-800/50 flex items-center justify-center">
              {isConfigured ? (
                <Bell className="h-4 w-4 text-brand-500" />
              ) : (
                <BellOff className="h-4 w-4 text-surface-400" />
              )}
            </div>
            <div className="text-left">
              <h2 className="text-sm font-semibold text-white">Create Alerts</h2>
              <p className="text-xs text-surface-500 font-light">
                {isConfigured
                  ? `Delivering daily at ${config!.deliveryTime} via ${config!.channel === "telegram" ? "Telegram" : config!.email}`
                  : "Get today's issue delivered to Telegram or email"}
              </p>
            </div>
          </div>
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-surface-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-surface-500" />
          )}
        </button>

        {expanded && (
          <div className="px-5 pb-5 border-t border-surface-800 pt-5 space-y-5">
            {/* ===== Channel selector ===== */}
            <div>
              <label className="block text-[11px] uppercase tracking-widest text-surface-500 mb-2">
                Delivery Channel
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => { setChannel("telegram"); setError(""); }}
                  className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-medium transition-colors ${
                    channel === "telegram"
                      ? "bg-brand-500/10 text-brand-500 border border-brand-500/20"
                      : "bg-surface-800/50 text-surface-400 border border-surface-800 hover:text-white"
                  }`}
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  Telegram
                </button>
                <button
                  onClick={() => { setChannel("email"); setError(""); }}
                  className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-medium transition-colors ${
                    channel === "email"
                      ? "bg-brand-500/10 text-brand-500 border border-brand-500/20"
                      : "bg-surface-800/50 text-surface-400 border border-surface-800 hover:text-white"
                  }`}
                >
                  <Mail className="h-3.5 w-3.5" />
                  Gmail
                </button>
              </div>
            </div>

            {/* ===== Channel-specific fields ===== */}
            {channel === "telegram" ? (
              <div>
                <label className="block text-[11px] uppercase tracking-widest text-surface-500 mb-2">
                  Connect Telegram
                </label>
                {chatId ? (
                  <div className="rounded-lg border border-brand-500/20 bg-gradient-to-br from-brand-500/10 to-brand-500/5 px-3.5 py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-brand-500" />
                      <span className="text-xs text-surface-300">
                        Connected — Chat ID: <span className="font-mono text-brand-500">{chatId}</span>
                      </span>
                    </div>
                    <button
                      onClick={() => setChatId(null)}
                      className="text-[11px] text-surface-500 hover:text-red-400 transition-colors"
                    >
                      Disconnect
                    </button>
                  </div>
                ) : linking ? (
                  <div className="rounded-lg border border-surface-800 bg-surface-900/80 px-3.5 py-3 text-center">
                    <Loader2 className="h-5 w-5 animate-spin text-brand-500 mx-auto mb-2" />
                    <p className="text-xs text-surface-400 mb-2">
                      Waiting for Telegram connection...
                    </p>
                    {linkStatus?.linked ? (
                      <div className="flex items-center justify-center gap-2 text-brand-500 text-xs">
                        <Check className="h-3.5 w-3.5" />
                        Connected!
                      </div>
                    ) : (
                      <>
                        <a
                          href={`https://t.me/WeLike_Alerts_bot`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-brand-500 hover:text-brand-400 transition-colors inline-flex items-center gap-1 mb-2"
                        >
                          Open @WeLike_Alerts_bot
                          <ExternalLink className="h-3 w-3" />
                        </a>
                        <p className="text-[11px] text-surface-600">
                          Send /start to the bot to connect
                        </p>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <button
                      onClick={startLinking}
                      className="w-full rounded-lg border border-surface-700 bg-surface-900 px-3.5 py-2.5 text-xs text-surface-400 hover:text-white hover:border-surface-600 transition-colors inline-flex items-center justify-center gap-2"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      Connect with @WeLike_Alerts_bot
                    </button>
                    {showManual && (
                      <>
                        <div className="relative">
                          <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-surface-800" />
                          </div>
                          <div className="relative flex justify-center">
                            <span className="bg-surface-900/50 px-2 text-[10px] text-surface-600">or enter Chat ID manually</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={manualChatId}
                            onChange={(e) => setManualChatId(e.target.value)}
                            placeholder="123456789"
                            className="flex-1 rounded-lg border border-surface-700 bg-surface-900 px-3.5 py-2 text-sm text-white placeholder:text-surface-500 focus-brand transition-colors font-mono"
                          />
                          <button
                            onClick={handleManualConnect}
                            disabled={!manualChatId.trim()}
                            className="rounded-lg border border-surface-700 bg-surface-900 px-3 py-2 text-xs text-surface-400 hover:text-white disabled:opacity-50 transition-colors"
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <p className="text-[11px] text-surface-600">
                          Start a chat with{" "}
                          <a href="https://t.me/WeLike_Alerts_bot" target="_blank" rel="noopener noreferrer" className="text-brand-500 hover:underline">
                            @WeLike_Alerts_bot
                          </a>
                          , send any message, then get your Chat ID from{" "}
                          <a href="https://t.me/userinfobot" target="_blank" rel="noopener noreferrer" className="text-brand-500 hover:underline">
                            @userinfobot
                          </a>
                        </p>
                      </>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div>
                <label className="block text-[11px] uppercase tracking-widest text-surface-500 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@gmail.com"
                  className="w-full rounded-lg border border-surface-700 bg-surface-900 px-3.5 py-2 text-sm text-white placeholder:text-surface-500 focus-brand transition-colors"
                />
              </div>
            )}

            {/* ===== Section selector ===== */}
            <div>
              <label className="block text-[11px] uppercase tracking-widest text-surface-500 mb-2">
                Sections to include
              </label>
              <div className="space-y-2">
                {SECTION_LABELS.map(({ key, label, desc }) => (
                  <button
                    key={key}
                    onClick={() => toggleSection(key)}
                    className={`w-full flex items-center gap-3 rounded-lg border px-3.5 py-2.5 text-left transition-colors ${
                      sections[key]
                        ? "border-brand-500/20 bg-brand-500/5"
                        : "border-surface-800 bg-surface-900/50 hover:bg-surface-800/50"
                    }`}
                  >
                    <div
                      className={`h-4 w-4 rounded border flex items-center justify-center transition-colors ${
                        sections[key]
                          ? "bg-brand-500 border-brand-500"
                          : "border-surface-600 bg-transparent"
                      }`}
                    >
                      {sections[key] && <Check className="h-3 w-3 text-black" />}
                    </div>
                    <div className="flex-1">
                      <span className={`text-xs font-medium ${sections[key] ? "text-white" : "text-surface-400"}`}>
                        {label}
                      </span>
                      <p className="text-[11px] text-surface-600">{desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* ===== Delivery time ===== */}
            <div>
              <label className="block text-[11px] uppercase tracking-widest text-surface-500 mb-1.5">
                <Clock className="h-3 w-3 inline mr-1" />
                Daily delivery time
              </label>
              <div className="flex gap-2">
                <input
                  type="time"
                  value={deliveryTime}
                  onChange={(e) => setDeliveryTime(e.target.value)}
                  className="flex-1 rounded-lg border border-surface-700 bg-surface-900 px-3.5 py-2 text-sm text-white focus-brand transition-colors"
                />
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="flex-1 rounded-lg border border-surface-700 bg-surface-900 px-3.5 py-2 text-sm text-white focus-brand transition-colors appearance-none cursor-pointer"
                >
                  {TIMEZONES.map((tz) => (
                    <option key={tz.value} value={tz.value} className="bg-surface-900 text-white">
                      {tz.label}
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-[11px] text-surface-600 mt-1">
                You'll receive the day's issue at this time in your selected timezone
              </p>
            </div>

            {/* ===== Error ===== */}
            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-3.5 py-2">
                <p className="text-xs text-red-400">{error}</p>
              </div>
            )}

            {/* ===== Actions ===== */}
            <div className="flex items-center gap-3 pt-1">
              {isConfigured ? (
                <>
                  <button
                    onClick={handleSendNow}
                    disabled={sending || !issue}
                    className="flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-xs font-semibold text-black hover:bg-brand-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {sending ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : sent ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <Send className="h-3.5 w-3.5" />
                    )}
                    {sending ? "Sending…" : sent ? "Sent!" : "Send now"}
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 rounded-lg border border-surface-700 bg-surface-900 px-4 py-2 text-xs text-surface-400 hover:text-white transition-colors"
                  >
                    <Check className="h-3.5 w-3.5" />
                    Update
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex items-center gap-2 rounded-lg border border-surface-700 bg-surface-900 px-4 py-2 text-xs text-surface-400 hover:text-red-400 hover:border-red-500/30 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Remove
                  </button>
                </>
              ) : (
                <button
                  onClick={handleSave}
                  disabled={channel === "telegram" ? !chatId : !email}
                  className="flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-xs font-semibold text-black hover:bg-brand-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Bell className="h-3.5 w-3.5" />
                  Save alert
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
