"use client";
import { useState, useEffect, useRef, useCallback } from "react";

/* ── Types ── */
type Lang = "en" | "zh";
type Tab = "news" | "funding" | "growth" | "tools" | "newsletter";
type NewsItem = { time?: string; title: string; source?: string; url?: string; summary?: string; background?: string; category?: string; tags?: string[]; analysis?: string };
type TrendItem = { title: string; category?: string; url?: string; mentions: number };
type TabCache = Record<Tab, NewsItem[] | null>;

/* ── i18n ── */
const I18N = {
  en: {
    nav_sub: "AI Intelligence", tab_news: "Daily News", tab_funding: "Funding",
    tab_growth: "Growth Insights", tab_tools: "AI Tools", tab_newsletter: "Newsletter",
    chip_news: "Today's Timeline", chip_funding: "Funding Updates",
    chip_growth: "Growth · Case Studies", chip_tools: "AI Tool Picks",
    chip_trending: "Top 5 Trending", refresh: "↻ Refresh", ctx_label: "Context",
    analysis_open: "analysis ↓", analysis_close: "less ↑",
    no_items: "No stories found", err_load: "Failed to load",
    err_trending: "Error loading trending", try_again: "↻ Try Again",
    foot_src: "Sources: OpenAI · Anthropic · Google DeepMind · Meta AI · The Verge · TechCrunch · Bloomberg · WSJ · FT · MIT Tech Review · VentureBeat",
    foot_r: "Internal use only",
    mentions: (n: number) => `${n} mentions`,
    lang_instr: "Output all text fields in English.",
  },
  zh: {
    nav_sub: "AI 情报", tab_news: "每日重要新闻", tab_funding: "融资动态",
    tab_growth: "增长洞察", tab_tools: "AI工具推荐", tab_newsletter: "Newsletter",
    chip_news: "今日时间线", chip_funding: "融资动态",
    chip_growth: "增长洞察 · 策略案例", chip_tools: "AI 工具推荐",
    chip_trending: "热门话题 Top 5", refresh: "↻ 刷新", ctx_label: "背景",
    analysis_open: "分析 ↓", analysis_close: "收起 ↑",
    no_items: "未找到相关报道", err_load: "加载失败",
    err_trending: "热门话题加载失败", try_again: "↻ 重试",
    foot_src: "来源：OpenAI · Anthropic · Google DeepMind · Meta AI · The Verge · TechCrunch · Bloomberg · WSJ · FT · MIT 科技评论 · VentureBeat",
    foot_r: "仅供内部使用",
    mentions: (n: number) => `${n} 次提及`,
    lang_instr: "Translate ALL text fields (title, summary, background, analysis, tags) into Simplified Chinese (简体中文). Keep source names, URLs, category values, and time format unchanged.",
  },
};

const TAB_CONFIG: Partial<Record<Tab, { chipClass: string; chipKey: string }>> = {
  news:    { chipClass: "chip-green",  chipKey: "chip_news"    },
  funding: { chipClass: "chip-orange", chipKey: "chip_funding" },
  growth:  { chipClass: "chip-blue",   chipKey: "chip_growth"  },
  tools:   { chipClass: "chip-purple", chipKey: "chip_tools"   },
};
const DOT:  Record<string, string> = { "Model update": "dg", Research: "db", Funding: "da", Policy: "dp", Product: "dd" };
const TAG:  Record<string, string> = { "Model update": "t-model", Research: "t-research", Funding: "t-funding", Policy: "t-policy", Product: "t-product" };
const CARD: Record<string, string> = { "Model update": "card-model", Research: "card-research", Funding: "card-funding", Policy: "card-policy", Product: "card-product" };
const SBCAT: Record<string, string> = { "Model update": "sb-cat-m", Research: "sb-cat-r", Funding: "sb-cat-f", Policy: "sb-cat-p", Product: "sb-cat-pr" };
const BARCLR: Record<string, string> = { "Model update": "var(--cn-model)", Research: "var(--cn-research)", Funding: "var(--cn-funding)", Policy: "var(--cn-policy)", Product: "var(--cn-product)" };

const JSON_SCHEMA = `{"items":[{"time":"","title":"max 12 words","source":"Publication","url":"https://...","summary":"2-3 sentences.","background":"2-3 sentences.","category":"Product","tags":["tag"],"analysis":"1-2 sentences."}]}`;

function esc(s: unknown) { return String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }

/* ── Kimi API ── */
async function kimiRequest(messages: object[], useSearch: boolean) {
  const body: Record<string, unknown> = { model: "moonshot-v1-32k", messages, temperature: 0.3, max_tokens: 4000 };
  if (useSearch) body.tools = [{ type: "builtin_function", function: { name: "$web_search" } }];
  const r = await fetch("/api/news", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (!r.ok) throw new Error(`Proxy error ${r.status}: ${await r.text()}`);
  return r.json();
}

async function runKimiLoop(messages: object[]): Promise<string> {
  let data = await kimiRequest(messages, true);
  for (let i = 0; i < 6; i++) {
    const choice = data.choices?.[0];
    if (!choice) throw new Error("Empty API response");
    if (choice.finish_reason === "stop") return choice.message?.content ?? "";
    if (choice.finish_reason === "tool_calls") {
      messages.push(choice.message);
      for (const tc of choice.message.tool_calls ?? [])
        messages.push({ role: "tool", tool_call_id: tc.id, name: tc.function.name, content: tc.function.arguments ?? "" });
      data = await kimiRequest(messages, true);
    } else return choice.message?.content ?? "";
  }
  throw new Error("Search loop did not terminate");
}

function parseJSON(text: string) {
  const c = text.replace(/```json/g, "").replace(/```/g, "").trim();
  try { return JSON.parse(c); } catch {}
  for (const key of ["items", "timeline", "trending"]) {
    const m = c.match(new RegExp(`"${key}"\\s*:\\s*([\\s\\S]*)`));
    if (!m) continue;
    let arr = m[1];
    try { return { [key]: JSON.parse(arr) }; } catch {}
    const last = arr.lastIndexOf("},");
    if (last !== -1) arr = arr.slice(0, last + 1) + "]";
    else { const lb = arr.lastIndexOf("}"); if (lb !== -1) arr = arr.slice(0, lb + 1) + "]"; }
    try { return { [key]: JSON.parse(arr) }; } catch {}
  }
  const m2 = c.match(/\{[\s\S]*\}/);
  if (m2) try { return JSON.parse(m2[0]); } catch {}
  throw new Error("JSON parse failed\n\n" + c.slice(0, 400));
}

async function fetchNews(today: string, li: string): Promise<NewsItem[]> {
  const SYS = `You are a senior AI industry analyst. Today is ${today}. Use web search to find the 5 most consequential AI stories from the past 24-48 hours. LANGUAGE: ${li} Return ONLY raw JSON (no fences). time field = "HH:MM". category = one of: Model update | Research | Funding | Policy | Product\n${JSON_SCHEMA}`;
  const raw = await runKimiLoop([{ role: "system", content: SYS }, { role: "user", content: `Find the 5 most important AI stories today (${today}). Return only the items JSON.` }]);
  return parseJSON(raw).items ?? [];
}
async function fetchFunding(today: string, li: string): Promise<NewsItem[]> {
  const SYS = `You are an AI venture capital analyst. Today is ${today}. Use web search to find the 5 most notable AI startup funding rounds or acquisitions from the past 7 days. LANGUAGE: ${li} Return ONLY raw JSON (no fences). Leave time field empty "". category must always be: Funding\n${JSON_SCHEMA}`;
  const raw = await runKimiLoop([{ role: "system", content: SYS }, { role: "user", content: `Find the 5 most notable AI funding rounds in the past 7 days (${today}). Return only the items JSON.` }]);
  return parseJSON(raw).items ?? [];
}
async function fetchGrowth(today: string, li: string): Promise<NewsItem[]> {
  const SYS = `You are a growth strategy analyst specializing in AI startups. Today is ${today}. Use web search to find 5 notable AI company growth insights or GTM strategy case studies from the past 2 weeks. LANGUAGE: ${li} Return ONLY raw JSON (no fences). Leave time field empty "". category = one of: Model update | Research | Funding | Policy | Product\n${JSON_SCHEMA}`;
  const raw = await runKimiLoop([{ role: "system", content: SYS }, { role: "user", content: `Find 5 AI startup growth strategy insights from the past 2 weeks (${today}). Return only the items JSON.` }]);
  return parseJSON(raw).items ?? [];
}
async function fetchTools(today: string, li: string): Promise<NewsItem[]> {
  const SYS = `You are an AI product curator. Today is ${today}. Use web search to find 5 new or recently launched AI tools from the past 2 weeks. LANGUAGE: ${li} Return ONLY raw JSON (no fences). Leave time field empty "". category = one of: Model update | Research | Funding | Policy | Product\n${JSON_SCHEMA}`;
  const raw = await runKimiLoop([{ role: "system", content: SYS }, { role: "user", content: `Find 5 new AI tools or products from the past 2 weeks (${today}). Return only the items JSON.` }]);
  return parseJSON(raw).items ?? [];
}
async function fetchTrending(today: string, li: string): Promise<TrendItem[]> {
  const SYS = `You are an AI news tracker. Today is ${today}. Use web search to find the 5 most-discussed AI topics in the past 24 hours. LANGUAGE: ${li} Return ONLY raw JSON (no fences):\n{"trending":[{"title":"max 8 words","category":"Model update","url":"https://...","mentions":84}]}\ncategory = one of: Model update | Research | Funding | Policy | Product. mentions range 20-100, descending.`;
  const raw = await runKimiLoop([{ role: "system", content: SYS }, { role: "user", content: `What are the 5 most-discussed AI topics right now (${today})? Return only the trending JSON.` }]);
  return parseJSON(raw).trending ?? [];
}

const FETCH_FN: Partial<Record<Tab, (today: string, li: string) => Promise<NewsItem[]>>> = { news: fetchNews, funding: fetchFunding, growth: fetchGrowth, tools: fetchTools };

const TG_LABELS: Record<Tab, { en: string; zh: string }> = {
  news:       { en: "Daily News",       zh: "每日重要新闻" },
  funding:    { en: "Funding Updates",  zh: "融资动态" },
  growth:     { en: "Growth Insights",  zh: "增长洞察" },
  tools:      { en: "AI Tool Picks",    zh: "AI工具推荐" },
  newsletter: { en: "Newsletter",       zh: "Newsletter" },
};

/* ── Component ── */
export default function NewsPage() {
  const now = useRef(new Date());
  const [lang, setLangState] = useState<Lang>("en");
  const [tab, setTab] = useState<Tab>("news");
  const [cache, setCache] = useState<TabCache>({ news: null, funding: null, growth: null, tools: null, newsletter: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trending, setTrending] = useState<TrendItem[] | null>(null);
  const [trendLoading, setTrendLoading] = useState(false);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  // Telegram modal state
  const [tgOpen, setTgOpen] = useState(false);
  const [tgToken, setTgToken] = useState("");
  const [tgChatId, setTgChatId] = useState("");
  const [tgSection, setTgSection] = useState<Tab>("news");
  const [tgStatus, setTgStatus] = useState<{ msg: string; ok: boolean } | null>(null);
  const [tgSending, setTgSending] = useState(false);
  const [schedEnabled, setSchedEnabled] = useState(false);
  const [schedTime, setSchedTime] = useState("09:00");
  const [schedLang, setSchedLang] = useState<Lang>("zh");
  const [schedSections, setSchedSections] = useState<Tab[]>(["news"]);
  const [schedStatus, setSchedStatus] = useState<{ msg: string; ok: boolean } | null>(null);

  const s = I18N[lang];
  const today = now.current.toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" });
  const dateDisplay = now.current.toLocaleDateString("en-GB", { weekday: "short", year: "numeric", month: "short", day: "numeric" }).toUpperCase();

  const loadTab = useCallback(async (t: Tab, l: Lang, c: TabCache) => {
    if (c[t]) return;
    const fn = FETCH_FN[t];
    if (!fn) return;
    setLoading(true); setError(null);
    try {
      const li = I18N[l].lang_instr;
      const items = await fn(today, li);
      setCache(prev => ({ ...prev, [t]: items }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [today]);

  const loadTrending = useCallback(async (l: Lang) => {
    setTrendLoading(true);
    try {
      const items = await fetchTrending(today, I18N[l].lang_instr);
      setTrending(items);
    } catch { setTrending([]); }
    finally { setTrendLoading(false); }
  }, [today]);

  useEffect(() => { loadTab(tab, lang, cache); }, []);
  useEffect(() => { loadTrending(lang); }, []);

  function switchLang(l: Lang) {
    if (l === lang) return;
    setLangState(l);
    setCache({ news: null, funding: null, growth: null, tools: null, newsletter: null });
    setTrending(null);
    const newCache = { news: null, funding: null, growth: null, tools: null, newsletter: null };
    loadTab(tab, l, newCache);
    loadTrending(l);
  }

  function switchTab(t: Tab) {
    setTab(t);
    loadTab(t, lang, cache);
  }

  function refresh() {
    setCache(prev => ({ ...prev, [tab]: null }));
    const newCache = { ...cache, [tab]: null };
    loadTab(tab, lang, newCache);
  }

  function toggleCard(id: string) {
    setExpandedCards(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }

  async function openTgModal() {
    const saved = JSON.parse(localStorage.getItem("tg_config") ?? "{}");
    if (saved.token) setTgToken(saved.token);
    if (saved.chatId) setTgChatId(saved.chatId);
    setTgSection(tab);
    setTgStatus(null); setSchedStatus(null);
    try {
      const r = await fetch("/api/schedule");
      const cfg = await r.json();
      setSchedEnabled(!!cfg.enabled);
      if (cfg.time) setSchedTime(cfg.time);
      if (cfg.lang) setSchedLang(cfg.lang);
      if (cfg.sections) setSchedSections(cfg.sections);
    } catch {}
    setTgOpen(true);
  }

  async function sendToTelegram() {
    if (!tgToken || !tgChatId) { setTgStatus({ msg: "请填写 Bot Token 和 Chat ID", ok: false }); return; }
    const items = cache[tgSection];
    if (!items?.length) { setTgStatus({ msg: "该板块暂无数据，请先加载内容", ok: false }); return; }
    setTgSending(true); setTgStatus(null);
    const label = TG_LABELS[tgSection][lang];
    const dateStr = now.current.toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric" });
    let msg = `📡 <b>JE Labs AI News</b>\n<b>${label}</b> · ${dateStr}\n\n`;
    items.slice(0, 5).forEach((item, i) => {
      msg += item.url ? `<b>${i + 1}. <a href="${item.url}">${esc(item.title)}</a></b>\n` : `<b>${i + 1}. ${esc(item.title)}</b>\n`;
      if (item.summary) msg += esc(item.summary) + "\n";
      if (item.source) msg += `<i>${esc(item.source)}</i>`;
      if (item.category) msg += ` · ${esc(item.category)}`;
      msg += "\n\n";
    });
    msg += "——\n<i>via JE Labs · Internal use only</i>";
    try {
      const r = await fetch("/api/telegram", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token: tgToken, chatId: tgChatId, text: msg }) });
      const data = await r.json();
      if (data.ok) {
        localStorage.setItem("tg_config", JSON.stringify({ token: tgToken, chatId: tgChatId }));
        setTgStatus({ msg: "✓ 已成功发送到 Telegram", ok: true });
      } else setTgStatus({ msg: `发送失败：${data.description ?? JSON.stringify(data)}`, ok: false });
    } catch (e) {
      setTgStatus({ msg: `请求失败：${e instanceof Error ? e.message : "Unknown"}`, ok: false });
    }
    setTgSending(false);
  }

  async function saveSchedule() {
    if (schedEnabled && (!tgToken || !tgChatId)) { setSchedStatus({ msg: "请先填写上方 Bot Token 和 Chat ID", ok: false }); return; }
    if (schedEnabled && !schedSections.length) { setSchedStatus({ msg: "请至少选择一个推送板块", ok: false }); return; }
    try {
      const r = await fetch("/api/schedule", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ enabled: schedEnabled, time: schedTime, sections: schedSections, lang: schedLang, token: tgToken, chatId: tgChatId }) });
      const data = await r.json();
      if (data.ok) setSchedStatus({ msg: schedEnabled ? `✓ 已设置：每天 ${schedTime} 自动推送` : "✓ 定时推送已关闭", ok: true });
    } catch (e) {
      setSchedStatus({ msg: `保存失败：${e instanceof Error ? e.message : "Unknown"}`, ok: false });
    }
  }

  const items = cache[tab];
  const chipCfg = TAB_CONFIG[tab] ?? { chipClass: "chip-green", chipKey: "chip_news" };

  /* ── Render helpers ── */
  function renderCard(item: NewsItem, idx: number) {
    const dc = DOT[item.category ?? ""] ?? "dd";
    const tc = TAG[item.category ?? ""] ?? "t-neutral";
    const cc = CARD[item.category ?? ""] ?? "card-product";
    const id = `${tab}-${idx}`;
    const expanded = expandedCards.has(id);
    const hasUrl = item.url?.startsWith("http");
    return (
      <div key={id} className="tl-item">
        <div className="tl-ts"><span>{item.time ?? ""}</span></div>
        <div className="tl-nd"><div className={`dot ${dc}`} /></div>
        <div className={`tl-card ${cc}`}>
          <div className="ct">
            <div className="ct-title">
              {hasUrl ? <a href={item.url} target="_blank" rel="noopener">{item.title}</a> : item.title}
            </div>
            {hasUrl
              ? <a className="ct-src" href={item.url} target="_blank" rel="noopener">{item.source ?? "Source"} ↗</a>
              : <span className="ct-src">{item.source ?? ""}</span>}
          </div>
          <div className="ct-body">{item.summary}</div>
          {item.background && (
            <div className="ctx">
              <div className="ctx-lbl">{s.ctx_label}</div>
              <div className="ctx-txt">{item.background}</div>
            </div>
          )}
          <div className="cf">
            <div className="tags">
              <span className={`tag ${tc}`}>{item.category}</span>
              {item.tags?.map(t => <span key={t} className="tag t-neutral">{t}</span>)}
            </div>
            {item.analysis && (
              <button className="xbtn" onClick={() => toggleCard(id)}>
                {expanded ? s.analysis_close : s.analysis_open}
              </button>
            )}
          </div>
          {item.analysis && <div className={`xtra${expanded ? " on" : ""}`}>{item.analysis}</div>}
        </div>
      </div>
    );
  }

  function renderSidebar() {
    if (trendLoading) return <div className="sb-list">{[80,65,50,38,25].map((w, i) => (
      <div key={i} className="sb-row">
        <div className="sb-head"><span className="sb-rk" style={{ color: "var(--cn-t4)" }}>#{i+1}</span><div className="sk" style={{ height: 13, flex: 1, borderRadius: 4 }} /></div>
        <div className="sb-bar-track"><div style={{ height: 2, width: `${w}%`, background: "var(--cn-bd2)", borderRadius: 2 }} /></div>
        <div style={{ display: "flex", justifyContent: "space-between" }}><div className="sk" style={{ height: 10, width: 52, borderRadius: 100 }} /><div className="sk" style={{ height: 10, width: 40 }} /></div>
      </div>
    ))}</div>;
    if (!trending?.length) return <div className="state-box" style={{ padding: 20 }}><div className="state-sub">{s.no_items}</div></div>;
    const max = trending[0].mentions ?? 1;
    return <div className="sb-list">{trending.slice(0, 5).map((item, i) => {
      const pct = Math.round((item.mentions / max) * 100);
      const cc = SBCAT[item.category ?? ""] ?? "sb-cat-m";
      const bc = BARCLR[item.category ?? ""] ?? "var(--cn-model)";
      return (
        <div key={i} className="sb-row">
          <div className="sb-head">
            <span className="sb-rk">#{i+1}</span>
            <div className="sb-title">
              {item.url ? <a href={item.url} target="_blank" rel="noopener">{item.title} ↗</a> : item.title}
            </div>
          </div>
          <div className="sb-bar-track"><div className="sb-bar-fill" style={{ width: `${pct}%`, background: bc }} /></div>
          <div className="sb-meta">
            <span className={`sb-cat ${cc}`}>{item.category}</span>
            <span className="sb-n">{s.mentions(item.mentions)}</span>
          </div>
        </div>
      );
    })}</div>;
  }

  return (
    <>
      <style>{`
        .cn-wrap{--cn-model:#00F5A0;--cn-research:#5aabff;--cn-funding:#ffb347;--cn-policy:#c084fc;--cn-product:#fb7185;--cn-bg:#07090d;--cn-s1:#0c0f16;--cn-s2:#111520;--cn-s3:#181e2c;--cn-s4:#1f2636;--cn-t1:#ededea;--cn-t2:#8f8f89;--cn-t3:#4a4a45;--cn-t4:#272724;--cn-bd1:rgba(255,255,255,0.05);--cn-bd2:rgba(255,255,255,0.09);--cn-bd3:rgba(255,255,255,0.15)}
        .je{background:var(--cn-s1);border-radius:20px;overflow:hidden;border:1px solid var(--cn-bd2);box-shadow:0 0 0 1px var(--cn-bd1),0 24px 64px rgba(0,0,0,.65),0 4px 16px rgba(0,0,0,.4)}
        .je-nav{display:flex;align-items:center;justify-content:space-between;padding:18px 32px;background:var(--cn-s1);border-bottom:1px solid var(--cn-bd1);position:relative}
        .je-nav::after{content:'';position:absolute;bottom:0;left:32px;width:72px;height:1px;background:linear-gradient(90deg,var(--cn-model),transparent)}
        .nav-wordmark{font-family:'Space Mono',monospace;font-size:15px;font-weight:700;color:var(--cn-model);letter-spacing:.05em}
        .nav-pipe{color:var(--cn-bd2);margin:0 14px;font-size:12px}
        .nav-sub{font-size:9.5px;font-weight:700;font-family:'Space Mono',monospace;letter-spacing:.14em;color:var(--cn-t3);text-transform:uppercase}
        .nav-right{display:flex;align-items:center;gap:12px}
        .lang-toggle{display:flex;align-items:center;background:rgba(255,255,255,.03);border:1px solid var(--cn-bd1);border-radius:100px;padding:3px;gap:2px}
        .lang-btn{font-family:'Space Mono',monospace;font-size:9px;font-weight:700;letter-spacing:.06em;padding:4px 13px;border-radius:100px;border:none;cursor:pointer;background:transparent;color:var(--cn-t3);transition:background .18s,color .18s}
        .lang-btn.active{background:rgba(0,245,160,.12);color:var(--cn-model);border:1px solid rgba(0,245,160,.28)}
        .lang-btn:not(.active):hover{color:var(--cn-t2)}
        .nav-date-block{display:flex;align-items:center;gap:9px;padding:7px 18px;border-radius:100px;background:rgba(0,245,160,.06);border:1px solid rgba(0,245,160,.18)}
        .nav-date-dot{width:6px;height:6px;border-radius:50%;background:var(--cn-model);box-shadow:0 0 8px var(--cn-model);animation:cn-pulse 2.4s ease-in-out infinite}
        @keyframes cn-pulse{0%,100%{opacity:1;box-shadow:0 0 8px var(--cn-model)}50%{opacity:.35;box-shadow:none}}
        .nav-date-txt{font-family:'Space Mono',monospace;font-size:10.5px;font-weight:700;color:var(--cn-model);letter-spacing:.06em;opacity:.85}
        .je-body{display:grid;grid-template-columns:1fr 308px;min-height:560px}
        .je-main{padding:28px 30px;border-right:1px solid var(--cn-bd1)}
        .je-side{padding:24px 20px;background:rgba(7,9,13,.5)}
        .sec-hd{display:flex;align-items:center;gap:12px;margin-bottom:16px}
        .sec-chip{font-family:'Space Mono',monospace;font-size:9px;font-weight:700;letter-spacing:.13em;text-transform:uppercase;padding:5px 13px;border-radius:100px;white-space:nowrap}
        .chip-green{background:rgba(0,245,160,.09);border:1px solid rgba(0,245,160,.22);color:var(--cn-model)}
        .chip-blue{background:rgba(90,171,255,.09);border:1px solid rgba(90,171,255,.22);color:var(--cn-research)}
        .chip-orange{background:rgba(255,179,71,.09);border:1px solid rgba(255,179,71,.22);color:var(--cn-funding)}
        .chip-purple{background:rgba(192,132,252,.09);border:1px solid rgba(192,132,252,.22);color:var(--cn-policy)}
        .sec-line{flex:1;height:1px;background:var(--cn-bd1)}
        .refresh-btn{display:inline-flex;align-items:center;gap:5px;font-family:'Space Mono',monospace;font-size:9.5px;font-weight:700;color:var(--cn-model);background:rgba(0,245,160,.06);border:1px solid rgba(0,245,160,.2);padding:5px 14px;border-radius:100px;cursor:pointer;letter-spacing:.05em;transition:background .2s,border-color .2s}
        .refresh-btn:hover{background:rgba(0,245,160,.14);border-color:rgba(0,245,160,.38)}
        .refresh-btn:disabled{opacity:.3;cursor:not-allowed}
        .tab-nav{display:flex;gap:0;margin-bottom:24px;border-bottom:1px solid var(--cn-bd1)}
        .tab-btn{font-family:'Space Mono',monospace;font-size:9px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;padding:8px 14px;border:none;background:transparent;color:var(--cn-t3);cursor:pointer;border-bottom:2px solid transparent;margin-bottom:-1px;transition:color .18s,border-color .18s;white-space:nowrap}
        .tab-btn:hover{color:var(--cn-t2)}
        .tab-btn[data-tab=news].active{color:var(--cn-model);border-bottom-color:var(--cn-model)}
        .tab-btn[data-tab=funding].active{color:var(--cn-funding);border-bottom-color:var(--cn-funding)}
        .tab-btn[data-tab=growth].active{color:var(--cn-research);border-bottom-color:var(--cn-research)}
        .tab-btn[data-tab=tools].active{color:var(--cn-policy);border-bottom-color:var(--cn-policy)}
        .tab-btn[data-tab=newsletter].active{color:var(--cn-model);border-bottom-color:var(--cn-model)}
        .tl{position:relative}
        .tl::before{content:'';position:absolute;left:42px;top:12px;bottom:12px;width:1px;background:linear-gradient(to bottom,transparent,var(--cn-bd2) 8%,var(--cn-bd2) 92%,transparent)}
        .tl-item{display:flex;margin-bottom:12px;animation:cn-fadeUp .38s ease forwards}
        .tl-item:nth-child(1){animation-delay:.04s}.tl-item:nth-child(2){animation-delay:.1s}.tl-item:nth-child(3){animation-delay:.16s}.tl-item:nth-child(4){animation-delay:.22s}.tl-item:nth-child(5){animation-delay:.28s}
        @keyframes cn-fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        .tl-ts{width:42px;flex-shrink:0;padding-right:10px;padding-top:12px;text-align:right}
        .tl-ts span{font-family:'Space Mono',monospace;font-size:9.5px;font-weight:700;color:var(--cn-t3);letter-spacing:.02em}
        .tl-nd{width:20px;flex-shrink:0;display:flex;justify-content:center;padding-top:13px;z-index:1;position:relative}
        .dot{width:10px;height:10px;border-radius:50%;flex-shrink:0}
        .dg{background:var(--cn-model);box-shadow:0 0 12px var(--cn-model)}.db{background:var(--cn-research);box-shadow:0 0 12px var(--cn-research)}.da{background:var(--cn-funding);box-shadow:0 0 12px var(--cn-funding)}.dp{background:var(--cn-policy);box-shadow:0 0 12px var(--cn-policy)}.dd{background:var(--cn-product);box-shadow:0 0 12px var(--cn-product)}
        .tl-card{flex:1;margin-left:14px;background:var(--cn-s2);border:1px solid var(--cn-bd1);border-radius:12px;padding:16px 20px;transition:border-color .2s,background .2s;box-shadow:0 2px 16px rgba(0,0,0,.22),inset 0 1px 0 rgba(255,255,255,.03);position:relative;overflow:hidden}
        .tl-card::before{content:'';position:absolute;left:0;top:0;bottom:0;width:3px;border-radius:12px 0 0 12px}
        .tl-card:hover{border-color:var(--cn-bd2);background:var(--cn-s3)}
        .card-model::before{background:var(--cn-model)}.card-research::before{background:var(--cn-research)}.card-funding::before{background:var(--cn-funding)}.card-policy::before{background:var(--cn-policy)}.card-product::before{background:var(--cn-product)}
        .ct{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:10px}
        .ct-title{font-size:14.5px;font-weight:600;line-height:1.46;color:var(--cn-t1);flex:1}
        .ct-title a{color:inherit;text-decoration:none;transition:color .15s}.ct-title a:hover{color:var(--cn-model)}
        .ct-src{font-family:'Space Mono',monospace;font-size:8.5px;font-weight:700;white-space:nowrap;flex-shrink:0;padding:3px 9px;border-radius:5px;background:rgba(167,139,250,.09);border:1px solid rgba(167,139,250,.2);color:#a78bfa;text-decoration:none;transition:background .15s;margin-top:2px}
        .ct-src:hover{background:rgba(167,139,250,.2)}
        .ct-body{font-size:13px;line-height:1.74;color:var(--cn-t2);margin-bottom:14px}
        .ctx{background:rgba(255,255,255,.015);border:1px solid var(--cn-bd1);border-left:2px solid var(--cn-bd2);border-radius:0 8px 8px 0;padding:10px 14px;margin-bottom:14px}
        .ctx-lbl{font-size:7.5px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:var(--cn-t3);margin-bottom:5px}
        .ctx-txt{font-size:12px;line-height:1.7;color:var(--cn-t3)}
        .cf{display:flex;align-items:center;justify-content:space-between;gap:8px}
        .tags{display:flex;gap:5px;flex-wrap:wrap}
        .tag{font-size:8.5px;padding:2px 8px;border-radius:100px;font-weight:700;letter-spacing:.03em}
        .t-model{background:rgba(0,245,160,.08);border:1px solid rgba(0,245,160,.2);color:rgba(0,245,160,.85)}.t-research{background:rgba(90,171,255,.08);border:1px solid rgba(90,171,255,.2);color:rgba(90,171,255,.85)}.t-funding{background:rgba(255,179,71,.08);border:1px solid rgba(255,179,71,.2);color:rgba(255,179,71,.85)}.t-policy{background:rgba(192,132,252,.08);border:1px solid rgba(192,132,252,.2);color:rgba(192,132,252,.85)}.t-product{background:rgba(251,113,133,.08);border:1px solid rgba(251,113,133,.2);color:rgba(251,113,133,.85)}.t-neutral{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);color:var(--cn-t3)}
        .xbtn{font-size:9px;color:var(--cn-t3);background:none;border:none;cursor:pointer;font-family:'Space Mono',monospace;white-space:nowrap;transition:color .1s;flex-shrink:0;letter-spacing:.04em}.xbtn:hover{color:var(--cn-model)}
        .xtra{display:none;margin-top:12px;padding-top:12px;border-top:1px solid var(--cn-bd1);font-size:12.5px;line-height:1.74;color:var(--cn-t2)}.xtra.on{display:block}
        .sb-list{display:flex;flex-direction:column;gap:8px}
        .sb-row{padding:13px 14px;background:var(--cn-s2);border:1px solid var(--cn-bd1);border-radius:10px;transition:border-color .2s,background .2s;box-shadow:0 2px 10px rgba(0,0,0,.18)}.sb-row:hover{border-color:var(--cn-bd2);background:var(--cn-s3)}
        .sb-head{display:flex;align-items:flex-start;gap:10px;margin-bottom:9px}
        .sb-rk{font-family:'Space Mono',monospace;font-size:10px;font-weight:700;color:var(--cn-t3);min-width:20px;padding-top:1px;flex-shrink:0}
        .sb-title{font-size:12px;font-weight:500;color:var(--cn-t1);line-height:1.46;flex:1}.sb-title a{color:inherit;text-decoration:none;transition:color .15s}.sb-title a:hover{color:var(--cn-model)}
        .sb-bar-track{height:2px;background:var(--cn-bd1);border-radius:2px;overflow:hidden;margin-bottom:8px}.sb-bar-fill{height:100%;border-radius:2px;transition:width .7s ease}
        .sb-meta{display:flex;justify-content:space-between;align-items:center}
        .sb-cat{font-size:8px;font-weight:700;padding:2px 7px;border-radius:100px;letter-spacing:.04em}.sb-cat-m{background:rgba(0,245,160,.08);color:rgba(0,245,160,.8)}.sb-cat-r{background:rgba(90,171,255,.08);color:rgba(90,171,255,.8)}.sb-cat-f{background:rgba(255,179,71,.08);color:rgba(255,179,71,.8)}.sb-cat-p{background:rgba(192,132,252,.08);color:rgba(192,132,252,.8)}.sb-cat-pr{background:rgba(251,113,133,.08);color:rgba(251,113,133,.8)}
        .sb-n{font-family:'Space Mono',monospace;font-size:8.5px;font-weight:700;color:var(--cn-t3)}
        .je-foot{padding:14px 32px;border-top:1px solid var(--cn-bd1);display:flex;align-items:center;justify-content:space-between;background:rgba(7,9,13,.5)}
        .foot-l{font-family:'Space Mono',monospace;font-size:8.5px;color:var(--cn-t3);line-height:1.7;letter-spacing:.02em}.foot-r{font-family:'Space Mono',monospace;font-size:8.5px;color:var(--cn-t4)}
        .state-box{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;padding:70px 20px;text-align:center}
        .state-title{font-size:13.5px;font-weight:500;color:var(--cn-t1)}.state-sub{font-size:12px;color:var(--cn-t3)}.state-err{font-size:10.5px;color:#f87171;max-width:400px;line-height:1.72;font-family:'Space Mono',monospace;word-break:break-all}
        .sk{border-radius:5px;background:linear-gradient(90deg,var(--cn-s2) 25%,var(--cn-s3) 50%,var(--cn-s2) 75%);background-size:400% 100%;animation:cn-shimmer 1.7s ease-in-out infinite}
        @keyframes cn-shimmer{0%{background-position:100% 0}100%{background-position:-100% 0}}
        .tg-btn{font-family:'Space Mono',monospace;font-size:9.5px;font-weight:700;color:#229ED9;background:rgba(34,158,217,.06);border:1px solid rgba(34,158,217,.2);padding:5px 14px;border-radius:100px;cursor:pointer;letter-spacing:.05em;transition:background .2s,border-color .2s;white-space:nowrap}.tg-btn:hover{background:rgba(34,158,217,.14);border-color:rgba(34,158,217,.38)}
        .modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.72);z-index:200;display:flex;align-items:center;justify-content:center;padding:20px}
        .modal{background:var(--cn-s1);border:1px solid var(--cn-bd2);border-radius:16px;padding:28px;width:100%;max-width:420px;box-shadow:0 24px 64px rgba(0,0,0,.6)}
        .modal-title{font-family:'Space Mono',monospace;font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#229ED9;margin-bottom:20px;display:flex;align-items:center;gap:8px}
        .modal-field{margin-bottom:16px}.modal-label{font-family:'Space Mono',monospace;font-size:8.5px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--cn-t3);display:block;margin-bottom:7px}
        .modal-input{width:100%;background:var(--cn-s2);border:1px solid var(--cn-bd2);border-radius:8px;padding:9px 13px;font-family:'Space Mono',monospace;font-size:11px;color:var(--cn-t1);outline:none;transition:border-color .18s}.modal-input:focus{border-color:rgba(34,158,217,.5)}
        .modal-hint{font-size:10.5px;color:var(--cn-t3);line-height:1.6;margin-top:6px}.modal-hint a{color:#229ED9;text-decoration:none}.modal-hint a:hover{text-decoration:underline}
        .modal-select{width:100%;background:var(--cn-s2);border:1px solid var(--cn-bd2);border-radius:8px;padding:9px 13px;font-family:'Space Mono',monospace;font-size:11px;color:var(--cn-t1);outline:none;cursor:pointer}
        .modal-actions{display:flex;gap:10px;margin-top:22px}
        .modal-send{flex:1;font-family:'Space Mono',monospace;font-size:10px;font-weight:700;letter-spacing:.06em;color:#fff;background:#229ED9;border:none;border-radius:8px;padding:10px;cursor:pointer;transition:background .18s}.modal-send:hover{background:#1a8bc2}.modal-send:disabled{opacity:.4;cursor:not-allowed}
        .modal-cancel{font-family:'Space Mono',monospace;font-size:10px;font-weight:700;letter-spacing:.06em;color:var(--cn-t3);background:var(--cn-s2);border:1px solid var(--cn-bd1);border-radius:8px;padding:10px 18px;cursor:pointer;transition:color .18s}.modal-cancel:hover{color:var(--cn-t2)}
        .modal-status{font-family:'Space Mono',monospace;font-size:10px;margin-top:14px;padding:10px 13px;border-radius:8px;line-height:1.5}
        .modal-status-ok{background:rgba(0,245,160,.08);border:1px solid rgba(0,245,160,.2);color:var(--cn-model)}.modal-status-err{background:rgba(248,113,113,.08);border:1px solid rgba(248,113,113,.2);color:#f87171}
        .modal-divider{height:1px;background:var(--cn-bd1);margin:22px 0}
        .modal-sched-hd{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}.modal-sched-title{font-family:'Space Mono',monospace;font-size:9.5px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--cn-t2)}
        .tog{position:relative;display:inline-block;width:38px;height:21px;flex-shrink:0}.tog input{opacity:0;width:0;height:0}.tog-sl{position:absolute;inset:0;background:var(--cn-bd2);border-radius:21px;cursor:pointer;transition:background .2s}.tog-sl::before{content:'';position:absolute;width:15px;height:15px;left:3px;top:3px;background:#fff;border-radius:50%;transition:transform .2s}.tog input:checked+.tog-sl{background:#229ED9}.tog input:checked+.tog-sl::before{transform:translateX(17px)}
        .sched-checks{display:flex;flex-direction:column;gap:9px}.sched-chk{display:flex;align-items:center;gap:9px;font-size:12px;color:var(--cn-t2);cursor:pointer}.sched-chk input{width:14px;height:14px;cursor:pointer;accent-color:#229ED9}
        @media(max-width:800px){.je-body{grid-template-columns:1fr}.je-side{border-top:1px solid var(--cn-bd1)}.je-main,.je-side{padding:20px}.nav-sub,.nav-pipe{display:none}.tab-btn{padding:7px 10px;font-size:8px}}
      `}</style>

      <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet" />

      <div className="cn-wrap" style={{ background: "radial-gradient(ellipse 900px 600px at 10% 0%,rgba(0,245,160,.055) 0%,transparent 65%),radial-gradient(ellipse 700px 500px at 90% 100%,rgba(90,171,255,.05) 0%,transparent 60%),#07090d", minHeight: "100vh", fontFamily: "'Space Grotesk',sans-serif", color: "var(--cn-t1)", fontSize: 14, WebkitFontSmoothing: "antialiased" }}>
        <div className="je">

          {/* Nav */}
          <div className="je-nav">
            <div style={{ display: "flex", alignItems: "center" }}>
              <span className="nav-wordmark">JE Labs</span>
              <span className="nav-pipe">·</span>
              <span className="nav-sub">{s.nav_sub}</span>
            </div>
            <div className="nav-right">
              <div className="lang-toggle">
                <button className={`lang-btn${lang === "en" ? " active" : ""}`} onClick={() => switchLang("en")}>EN</button>
                <button className={`lang-btn${lang === "zh" ? " active" : ""}`} onClick={() => switchLang("zh")}>中文</button>
              </div>
              <button className="tg-btn" onClick={openTgModal}>✈ Telegram</button>
              <div className="nav-date-block">
                <div className="nav-date-dot" />
                <span className="nav-date-txt">{dateDisplay}</span>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="je-body">
            <div className="je-main">
              <div className="sec-hd">
                <div className={`sec-chip ${chipCfg.chipClass}`}>{s[chipCfg.chipKey as keyof typeof s] as string}</div>
                <div className="sec-line" />
                <button className="refresh-btn" disabled={loading} onClick={refresh}>
                  {loading ? "..." : s.refresh}
                </button>
              </div>

              <nav className="tab-nav">
                {(["news", "funding", "growth", "tools", "newsletter"] as Tab[]).map(t => (
                  <button key={t} className={`tab-btn${tab === t ? " active" : ""}`} data-tab={t} onClick={() => {
                    if (t === "newsletter") {
                      window.location.href = "/tools/news/archive";
                    } else {
                      switchTab(t);
                    }
                  }}>
                    {s[`tab_${t}` as keyof typeof s] as string}
                  </button>
                ))}
              </nav>

              {loading && !items ? (
                <div className="tl">
                  {[0,1,2].map(i => (
                    <div key={i} className="tl-item" style={{ opacity: 1, animation: "none" }}>
                      <div className="tl-ts"><span style={{ opacity: 0 }}>--</span></div>
                      <div className="tl-nd"><div className="dot" style={{ background: "var(--cn-bd2)", boxShadow: "none" }} /></div>
                      <div className="tl-card" style={{ borderLeft: "3px solid var(--cn-bd2)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 12 }}>
                          <div className="sk" style={{ height: 17, flex: 1 }} />
                          <div className="sk" style={{ height: 17, width: 64 }} />
                        </div>
                        <div className="sk" style={{ height: 13, width: "100%", marginBottom: 7 }} />
                        <div className="sk" style={{ height: 13, width: "88%", marginBottom: 7 }} />
                        <div className="sk" style={{ height: 13, width: "60%", marginBottom: 16 }} />
                        <div className="sk" style={{ height: 36, width: "100%", marginBottom: 14 }} />
                        <div style={{ display: "flex", gap: 6 }}>
                          <div className="sk" style={{ height: 18, width: 80 }} />
                          <div className="sk" style={{ height: 18, width: 56 }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="state-box">
                  <div className="state-title" style={{ color: "#f87171" }}>{s.err_load}</div>
                  <div className="state-err">{error}</div>
                  <button className="refresh-btn" style={{ marginTop: 12 }} onClick={refresh}>{s.try_again}</button>
                </div>
              ) : !items?.length ? (
                <div className="state-box"><div className="state-title">{s.no_items}</div></div>
              ) : (
                <div className="tl">{items.map((item, idx) => renderCard(item, idx))}</div>
              )}
            </div>

            {/* Sidebar */}
            <div className="je-side">
              <div className="sec-hd">
                <div className="sec-chip chip-blue">{s.chip_trending}</div>
                <div className="sec-line" />
              </div>
              {renderSidebar()}
            </div>
          </div>

          {/* Footer */}
          <div className="je-foot">
            <div className="foot-l">{s.foot_src}</div>
            <div className="foot-r">{s.foot_r}</div>
          </div>
        </div>
      </div>

      {/* Telegram Modal */}
      {tgOpen && (
        <div className="modal-overlay cn-wrap" onClick={e => e.target === e.currentTarget && setTgOpen(false)}>
          <div className="modal">
            <div className="modal-title">✈ &nbsp;Send to Telegram</div>
            <div className="modal-field">
              <label className="modal-label">Bot Token</label>
              <input className="modal-input" type="password" value={tgToken} onChange={e => setTgToken(e.target.value)} placeholder="110201543:AAHdqTcvCH1vGWJxfSeofSAs0K5PALDsaw" />
              <div className="modal-hint">从 <a href="https://t.me/BotFather" target="_blank" rel="noopener">@BotFather</a> 获取 Bot Token</div>
            </div>
            <div className="modal-field">
              <label className="modal-label">Chat ID / Channel</label>
              <input className="modal-input" type="text" value={tgChatId} onChange={e => setTgChatId(e.target.value)} placeholder="-1001234567890 或 @channel_name" />
            </div>
            <div className="modal-field">
              <label className="modal-label">发送板块</label>
              <select className="modal-select" value={tgSection} onChange={e => setTgSection(e.target.value as Tab)}>
                <option value="news">每日重要新闻</option>
                <option value="funding">融资动态</option>
                <option value="growth">增长洞察</option>
                <option value="tools">AI工具推荐</option>
              </select>
            </div>
            <div className="modal-actions">
              <button className="modal-send" disabled={tgSending} onClick={sendToTelegram}>{tgSending ? "发送中..." : "发送"}</button>
              <button className="modal-cancel" onClick={() => setTgOpen(false)}>取消</button>
            </div>
            {tgStatus && <div className={`modal-status ${tgStatus.ok ? "modal-status-ok" : "modal-status-err"}`}>{tgStatus.msg}</div>}

            <div className="modal-divider" />

            <div className="modal-sched-hd">
              <span className="modal-sched-title">⏰ &nbsp;定时推送</span>
              <label className="tog">
                <input type="checkbox" checked={schedEnabled} onChange={e => setSchedEnabled(e.target.checked)} />
                <span className="tog-sl" />
              </label>
            </div>
            {schedEnabled && (
              <>
                <div className="modal-field">
                  <label className="modal-label">每天推送时间（本地时间）</label>
                  <input className="modal-input" type="time" value={schedTime} onChange={e => setSchedTime(e.target.value)} />
                </div>
                <div className="modal-field">
                  <label className="modal-label">推送板块</label>
                  <div className="sched-checks">
                    {(["news", "funding", "growth", "tools"] as Tab[]).map(t => (
                      <label key={t} className="sched-chk">
                        <input type="checkbox" checked={schedSections.includes(t)} onChange={e => setSchedSections(prev => e.target.checked ? [...prev, t] : prev.filter(x => x !== t))} />
                        {TG_LABELS[t].zh}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="modal-field">
                  <label className="modal-label">推送语言</label>
                  <select className="modal-select" value={schedLang} onChange={e => setSchedLang(e.target.value as Lang)}>
                    <option value="zh">中文</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </>
            )}
            <button className="modal-send" style={{ width: "100%", marginTop: 4 }} onClick={saveSchedule}>保存定时设置</button>
            {schedStatus && <div className={`modal-status ${schedStatus.ok ? "modal-status-ok" : "modal-status-err"}`}>{schedStatus.msg}</div>}
          </div>
        </div>
      )}
    </>
  );
}
