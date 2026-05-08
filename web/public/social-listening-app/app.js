const API_BASE = "";

// ===== i18n =====
const I18N = {
  zh: {
    nav_analyze: "社交聆听",
    nav_compare: "竞品对比",
    nav_alerts: "智能提醒",
    hero_title_1: "AI 驱动的社交聆听",
    hero_title_2: '实时<span class="accent">捕捉</span>，即刻<span class="accent">决策</span>',
    time_select_title: "时间范围",
    progress_preparing: "准备中...",
    err_generic: "发生错误",
    btn_search_again: "重新搜索",
    server_error: "服务器错误",
    submitting_task: "提交任务...",
    hero_desc: "输入关键词或项目 X 主页链接，WeLike 社交聆听会在几十秒内<br>抓取推文、识别叙事、判定紧急度，并生成可执行的市场策略报告",
    search_placeholder: "例：Claude  或  https://x.com/AnthropicAI",
    btn_analyze: "开始分析",
    btn_analyzing: "分析中...",
    btn_reanalyze: "重新分析",
    time_24h: "24 小时",
    time_7d: "近 7 天",
    time_14d: "近 14 天",
    examples: "快速示例：",
    stat_tweets: "推文总数",
    stat_pos: "积极占比",
    stat_neg: "消极占比",
    stat_neu: "中性占比",
    stat_urgent: "高紧急度",
    unit_count: "条",
    card_sentiment: "情感分布",
    card_categories: "类别分布",
    card_topics: "热点话题",
    card_topics_hint: "点击话题查看驱动推文与行动建议",
    card_raw_tweets: "原始推文",
    card_report: "市场策略报告",
    card_chat: "追问 AI",
    card_chat_hint: "基于已采集的数据",
    topic_empty: "点击左侧任意话题，查看对应的驱动推文与逐条推荐动作",
    topic_overall_advice: "整体建议：",
    topic_driving_tweets_count: "条驱动推文",
    topic_no_tweets: "该话题没有关联的具体推文",
    topic_urgency_suffix: " urgency",
    suggested_action_label: "SUGGESTED ACTION",
    filter_all: "全部",
    filter_key_voice: "关键声音",
    filter_feature: "功能建议",
    filter_bug: "问题反馈",
    filter_competitor: "竞品对比",
    filter_pos: "积极",
    filter_neg: "消极",
    filter_neu: "中性",
    sent_positive: "积极",
    sent_negative: "消极",
    sent_neutral: "中性",
    sent_mixed: "混合",
    urg_high: "🚨 高",
    urg_medium: "⚠️ 中",
    urg_low: "· 低",
    cat_key_voice: "关键声音",
    cat_feature_request: "功能建议",
    cat_bug_issue: "问题反馈",
    cat_competitor: "竞品对比",
    cat_general: "一般讨论",
    type_tweet: "Tweet",
    type_quote: "Quote RT",
    type_reply: "Comment",
    type_thread: "Thread",
    action_reply_now: "立即回复",
    action_log_product: "产品记录",
    action_monitor: "监控跟踪",
    action_share_amplify: "扩散转发",
    action_ignore: "忽略",
    suggested_action_inline: "建议动作：",
    followers_suffix: "粉",
    chat_placeholder: "例如：消极的声音里，最紧急的一条是什么？应该怎么回？",
    chat_send: "发送 →",
    chat_thinking: "思考中...",
    chat_empty_reply: "(空回复)",
    chat_floating_label: "追问 AI",
    chat_empty_hint: "先在上方完成一次分析，然后在这里追问任何问题 ✨",
    chat_suggest_3: "3 条立回",
    chat_suggest_features: "功能建议",
    chat_suggest_neg: "负面根因",
    chat_suggest_compare: "竞品差距",
    no_tweets: "暂无推文",
    no_topics: "未识别出话题",
    err_no_backend: "分析服务暂时不可用。<br/><br/>",
    err_polling: "轮询状态失败：",
    err_run_first: "请先运行一次分析",
    compare_title_em: "Competitor",
    compare_title_rest: "side-by-side.",
    compare_desc: "最多输入 4 个关键词（项目 / 竞品），并排查看情绪、类别分布和高互动推文。",
    compare_input_1: "竞品 1 (必填)",
    compare_input_2: "竞品 2 (必填)",
    compare_input_3: "竞品 3 (选填)",
    compare_input_4: "竞品 4 (选填)",
    compare_btn: "开始对比 →",
    compare_min2: "至少填入 2 个关键词",
    compare_failed: "对比失败：",
    compare_top_tweets_label: "TOP TWEETS",
    alerts_eyebrow: "实时舆情预警",
    alerts_title_em: "Smart",
    alerts_title_rest: "Alerts",
    alerts_desc: "通过 Telegram Bot 接收实时舆情推送。先连接你的 Telegram 账号，之后网页和 Telegram 共享同一份监听",
    alerts_optional: "(选填)",
    alerts_create_title: "创建你的监听",
    alerts_label_handles: "项目 X handles",
    alerts_handles_ph: "@WeLike",
    alerts_label_keywords: "关键词",
    alerts_keywords_ph: "WeLike（空格分隔，最多 3 个）",
    alerts_keywords_max: "· 最多 3 个",
    alerts_keywords_too_many: "关键词最多 {n} 个，请精简后再创建",
    alerts_digest_hint_short: "把高频通知合并成一条摘要",
    alerts_digest_tooltip: "开启后，我们会在短时间内出现大量命中时把它们合并成一条摘要发送，避免你的手机被通知轰炸。",
    disconnect_title: "Telegram 已断开",
    disconnect_desc: "网页端无法管理监听了。重新连接 Telegram 才能继续接收实时舆情推送。",
    disconnect_btn: "立即重新连接 →",
    urg_high_label: "🚨 高",
    urg_medium_label: "⚠️ 中",
    urg_low_label: "🔵 低",
    alerts_label_filter: "情感过滤",
    alerts_filter_multi_hint: "(可多选)",
    alerts_preview_label: "实时预览：Telegram 推送长这样",
    alerts_preview_hint: "在左侧填入 handle 或关键词，预览会立即更新 ✨",
    alerts_preview_meta_time: "2 分钟前",
    alerts_preview_bot_status: "bot · online",
    alerts_preview_new_mention: "· 新提及",
    alerts_preview_time: "刚刚",
    alerts_preview_summary: "AI 一句话提炼这条推文要回什么",
    alerts_handles_too_many: "Project Handle 最多 {n} 个",
    alerts_banner_active_title: "ACTIVE · 正在监听",
    alerts_banner_active_sub: "每 {interval} 分钟自动扫描新提及",
    alerts_banner_paused_title: "PAUSED · 已暂停",
    alerts_banner_paused_sub: "新提及不会推送到 Telegram",
    alerts_block_watching: "监听对象",
    alerts_block_filters: "筛选条件",
    alerts_block_schedule: "执行节奏",
    alerts_block_digest: "聚合推送",
    alerts_block_preview: "推送示例 · 实时跟随筛选",
    alerts_digest_on_explainer: "已开启 · 高频命中会合并为一条摘要",
    alerts_digest_off_explainer: "已关闭 · 每条命中独立推送",
    alerts_meta_telegram_none: "(空)",
    cta_eyebrow: "REAL-TIME · 一键转预警",
    cta_title: '把这次分析变成<span class="accent">实时预警</span>',
    cta_prefill_handle: "监听",
    cta_prefill_sentiment: "情感",
    cta_prefill_urgency: "紧急度",
    cta_btn_create: "一键创建 Alert",
    cta_btn_dismiss: "稍后再说",
    cta_tg_suffix: "· 新提及",
    cta_tg_time: "🕐 刚刚",
    cta_tg_summary: "📌 AI 一句话提炼这条推文要回什么",
    alerts_btn_create: "创建 Alert",
    alerts_btn_refresh: "刷新 ↻",
    alerts_active: "当前监听",
    alerts_active_label: "运行中",
    alerts_paused_label: "已暂停",
    alerts_status_click_pause: "点击暂停推送",
    alerts_status_click_resume: "点击恢复推送",
    alerts_run_now_tip: "立即拉取一次（不影响 10 分钟自动轮询）",
    alerts_run_now: "▶ 立即执行",
    alerts_running: "运行中...",
    alerts_pause: "⏸ 暂停",
    alerts_resume: "▶ 恢复",
    alerts_delete: "删除",
    alerts_inputs_required: "至少要填一个 handle 或关键词",
    alerts_create_failed: "创建失败：",
    alerts_confirm_delete: "确定删除这个监听？",
    alerts_meta_filter: "情感过滤",
    alerts_meta_urgency: "紧急度过滤",
    alerts_meta_digest: "聚合推送",
    alerts_meta_interval: "间隔",
    alerts_meta_last_run: "上次执行",
    alerts_meta_never: "尚未执行",
    alerts_label_urgency: "紧急度过滤",
    alerts_label_digest: "聚合推送",
    alerts_digest_hint: "单轮命中 ≥5 条时合并为一条摘要，避免轰炸",
    alerts_digest_on: "开",
    alerts_digest_off: "关",
    alerts_digest_turn_on: "开启聚合",
    alerts_digest_turn_off: "关闭聚合",
    urg_high_only: "仅 🚨 高",
    urg_medium_only: "仅 ⚠️ 中",
    urg_low_only: "仅 🔵 低",
    urg_high_short: "高",
    urg_medium_short: "中",
    urg_low_short: "低",
    // Telegram link / connect
    connect_title: "连接你的 Telegram",
    connect_desc: "你的预警雷达还在沉睡，连接 Telegram 即可开启实时舆情捕捉 ✨",
    connect_btn: "连接 Telegram →",
    connect_failed: "连接失败：",
    connect_no_bot: "Bot 未配置",
    linking_title: "等待 Telegram 确认",
    linking_desc: "已为你打开 Telegram。请在 Bot 里点 Start 按钮。完成后这个页面会自动刷新。",
    linking_open: "如未自动跳转，点这里打开 Telegram ↗",
    linking_cancel: "取消",
    linking_timeout: "超时未完成，请重试。",
    linking_expired: "链接已过期，请重试。",
    link_connected_prefix: "已连接到 Telegram：",
    link_disconnect: "断开",
    link_disconnect_confirm: "断开后网页将无法管理监听，但 Telegram 端的监听仍在运行。确定吗？",
    progress_init: "正在初始化...",
    progress_connecting: "正在连接服务器...",
    err_unknown: "出错了：",
    footer: "WeLike · 社交聆听 · 基于 Claude API + X API",
    // Timeline + reply
    card_timeline: "热度 & 里程碑",
    card_timeline_hint: "日热度折线 + AI 推断的项目里程碑",
    timeline_loading: "正在分析时间线…",
    timeline_empty: "时间范围内的数据不足以构建时间线",
    timeline_y_count: "推文数",
    timeline_y_engagement: "互动量",
    milestone_label: "里程碑",
    milestone_empty: "未发现明显的里程碑事件",
    btn_gen_reply: "✨ 生成回复",
    btn_gen_reply_loading: "起草中…",
    reply_user_question: "请帮我为 @{handle} 这条推文起草回复",
  },
  en: {
    nav_analyze: "Analyze",
    nav_compare: "Compare",
    nav_alerts: "Smart Alerts",
    hero_title_1: "AI-powered social listening",
    hero_title_2: '<span class="accent">Capture</span> in real time, <span class="accent">decide</span> instantly',
    time_select_title: "Time range",
    progress_preparing: "Preparing...",
    err_generic: "Something went wrong",
    btn_search_again: "Search again",
    server_error: "Server error",
    submitting_task: "Submitting task...",
    hero_desc: "Paste a keyword or project X handle.<br>WeLike Social Listening captures tweets, identifies narratives, scores urgency, and generates an executable market response report in seconds",
    search_placeholder: "e.g., Claude  or  https://x.com/AnthropicAI",
    btn_analyze: "Analyze",
    btn_analyzing: "Analyzing...",
    btn_reanalyze: "Re-analyze",
    time_24h: "24 hours",
    time_7d: "Last 7 days",
    time_14d: "Last 14 days",
    examples: "Try:",
    stat_tweets: "TWEETS",
    stat_pos: "POSITIVE",
    stat_neg: "NEGATIVE",
    stat_neu: "NEUTRAL",
    stat_urgent: "HIGH URGENCY",
    unit_count: "items",
    card_sentiment: "Sentiment",
    card_categories: "Categories",
    card_topics: "Hot Topics",
    card_topics_hint: "click a topic to see driving tweets & actions",
    card_raw_tweets: "Raw Tweets",
    card_report: "Strategy Report",
    card_chat: "Ask follow-up",
    card_chat_hint: "grounded in your data",
    topic_empty: "Click any topic on the left to see its driving tweets and per-tweet recommended actions",
    topic_overall_advice: "Overall recommendation:",
    topic_driving_tweets_count: "driving tweets",
    topic_no_tweets: "No tweets linked to this topic",
    topic_urgency_suffix: " urgency",
    suggested_action_label: "SUGGESTED ACTION",
    filter_all: "All",
    filter_key_voice: "Key Voices",
    filter_feature: "Feature Requests",
    filter_bug: "Bugs / Issues",
    filter_competitor: "Competitor",
    filter_pos: "Positive",
    filter_neg: "Negative",
    filter_neu: "Neutral",
    sent_positive: "positive",
    sent_negative: "negative",
    sent_neutral: "neutral",
    sent_mixed: "mixed",
    urg_high: "🚨 high",
    urg_medium: "⚠️ med",
    urg_low: "· low",
    cat_key_voice: "Key Voice",
    cat_feature_request: "Feature Request",
    cat_bug_issue: "Bug / Issue",
    cat_competitor: "Competitor",
    cat_general: "General",
    type_tweet: "Tweet",
    type_quote: "Quote RT",
    type_reply: "Comment",
    type_thread: "Thread",
    action_reply_now: "Reply now",
    action_log_product: "Log to product",
    action_monitor: "Monitor",
    action_share_amplify: "Amplify",
    action_ignore: "Ignore",
    suggested_action_inline: "Suggested action:",
    followers_suffix: "followers",
    chat_placeholder: "e.g., Of the negative voices, which is most urgent? How should we respond?",
    chat_send: "Send →",
    chat_thinking: "Thinking...",
    chat_empty_reply: "(empty reply)",
    chat_floating_label: "Ask AI",
    chat_empty_hint: "Run an analysis above, then ask any follow-up here ✨",
    chat_suggest_3: "Top 3 to reply",
    chat_suggest_features: "Feature requests",
    chat_suggest_neg: "Negative root cause",
    chat_suggest_compare: "Vs. competitors",
    no_tweets: "No tweets",
    no_topics: "No topics detected",
    err_no_backend: "The analysis service is temporarily unavailable.<br/><br/>",
    err_polling: "Status polling failed: ",
    err_run_first: "Please run an analysis first",
    compare_title_em: "Competitor",
    compare_title_rest: "side-by-side.",
    compare_desc: "Up to 4 keywords (project / competitor) compared side-by-side: sentiment, category mix, top tweets.",
    compare_input_1: "Competitor 1 (required)",
    compare_input_2: "Competitor 2 (required)",
    compare_input_3: "Competitor 3 (optional)",
    compare_input_4: "Competitor 4 (optional)",
    compare_btn: "Compare →",
    compare_min2: "Please enter at least 2 keywords",
    compare_failed: "Compare failed: ",
    compare_top_tweets_label: "TOP TWEETS",
    alerts_eyebrow: "Real-time signal alerts",
    alerts_title_em: "Smart",
    alerts_title_rest: "Alerts",
    alerts_desc: "Receive real-time alerts through our Telegram bot. Connect your Telegram once — then manage from web or Telegram, both share the same alert",
    alerts_optional: "(optional)",
    alerts_create_title: "Create your alert",
    alerts_label_handles: "Project X handles",
    alerts_handles_ph: "@WeLike",
    alerts_label_keywords: "Keywords",
    alerts_keywords_ph: "WeLike (space-separated, up to 3)",
    alerts_keywords_max: "· up to 3",
    alerts_keywords_too_many: "Up to {n} keywords. Please trim and try again.",
    alerts_digest_hint_short: "Bundle high-frequency hits into one summary",
    alerts_digest_tooltip: "When enabled, we'll merge bursts of matching tweets into a single summary so you're not flooded with notifications.",
    disconnect_title: "Telegram disconnected",
    disconnect_desc: "Web management is offline. Reconnect Telegram to keep receiving real-time alerts.",
    disconnect_btn: "Reconnect now →",
    urg_high_label: "🚨 high",
    urg_medium_label: "⚠️ med",
    urg_low_label: "🔵 low",
    alerts_label_filter: "Sentiment filter",
    alerts_filter_multi_hint: "(multi-select)",
    alerts_preview_label: "Live preview — what your Telegram push looks like",
    alerts_preview_hint: "Fill in a handle or keyword on the left — this preview updates live ✨",
    alerts_preview_meta_time: "2 min ago",
    alerts_preview_bot_status: "bot · online",
    alerts_preview_new_mention: "· New mention",
    alerts_preview_time: "just now",
    alerts_preview_summary: "AI one-liner summarizing what to reply to",
    alerts_handles_too_many: "Up to {n} project handle",
    alerts_banner_active_title: "ACTIVE · monitoring",
    alerts_banner_active_sub: "Auto-scan for new mentions every {interval} min",
    alerts_banner_paused_title: "PAUSED",
    alerts_banner_paused_sub: "New mentions are not being pushed to Telegram",
    alerts_block_watching: "Watching",
    alerts_block_filters: "Filters",
    alerts_block_schedule: "Schedule",
    alerts_block_digest: "Digest mode",
    alerts_block_preview: "Push preview · live with filters",
    alerts_digest_on_explainer: "On · bursts of hits collapse into one summary",
    alerts_digest_off_explainer: "Off · every match arrives as its own message",
    alerts_meta_telegram_none: "(none)",
    cta_eyebrow: "REAL-TIME · one-click to alerts",
    cta_title: 'Turn this analysis into a <span class="accent">live alert</span>',
    cta_prefill_handle: "Watching",
    cta_prefill_sentiment: "Sentiment",
    cta_prefill_urgency: "Urgency",
    cta_btn_create: "Create alert in one click",
    cta_btn_dismiss: "Maybe later",
    cta_tg_suffix: "· New mention",
    cta_tg_time: "🕐 just now",
    cta_tg_summary: "📌 AI one-liner summarizing what to reply to",
    alerts_btn_create: "Create Alert",
    alerts_btn_refresh: "Refresh ↻",
    alerts_active: "Your alert",
    alerts_active_label: "active",
    alerts_paused_label: "paused",
    alerts_status_click_pause: "Click to pause pushes",
    alerts_status_click_resume: "Click to resume pushes",
    alerts_run_now_tip: "Trigger one poll right now (the regular 10-min schedule keeps running)",
    alerts_run_now: "▶ Run now",
    alerts_running: "Running...",
    alerts_pause: "⏸ Pause",
    alerts_resume: "▶ Resume",
    alerts_delete: "Delete",
    alerts_inputs_required: "Please enter at least one handle or keyword",
    alerts_create_failed: "Create failed: ",
    alerts_confirm_delete: "Delete this alert?",
    alerts_meta_filter: "sentiment",
    alerts_meta_urgency: "urgency",
    alerts_meta_digest: "digest",
    alerts_meta_interval: "interval",
    alerts_meta_last_run: "last run",
    alerts_meta_never: "not yet",
    alerts_label_urgency: "Urgency filter",
    alerts_label_digest: "Digest mode",
    alerts_digest_hint: "When ≥5 hits land in one poll, batch them into a single summary",
    alerts_digest_on: "on",
    alerts_digest_off: "off",
    alerts_digest_turn_on: "Enable digest",
    alerts_digest_turn_off: "Disable digest",
    urg_high_only: "🚨 High only",
    urg_medium_only: "⚠️ Medium only",
    urg_low_only: "🔵 Low only",
    urg_high_short: "high",
    urg_medium_short: "med",
    urg_low_short: "low",
    // Telegram link / connect
    connect_title: "Connect your Telegram",
    connect_desc: "Your alert radar is still asleep — connect Telegram to start capturing market signals in real time ✨",
    connect_btn: "Connect Telegram →",
    connect_failed: "Connection failed: ",
    connect_no_bot: "Bot is not configured",
    linking_title: "Waiting for Telegram",
    linking_desc: "We opened Telegram for you. Tap the Start button in the bot. This page will refresh automatically.",
    linking_open: "If Telegram didn't open, tap here ↗",
    linking_cancel: "Cancel",
    linking_timeout: "Timed out. Please try again.",
    linking_expired: "Link expired. Please try again.",
    link_connected_prefix: "Connected to Telegram:",
    link_disconnect: "Disconnect",
    link_disconnect_confirm: "Disconnecting only logs out from the website. Your Telegram alerts will keep running. Continue?",
    progress_init: "Initializing...",
    progress_connecting: "Connecting to server...",
    err_unknown: "Error: ",
    footer: "WeLike · Social Listening · powered by Claude API + X API",
    // Timeline + reply
    card_timeline: "Heat & Milestones",
    card_timeline_hint: "Daily heat line + AI-inferred project milestones",
    timeline_loading: "Building timeline…",
    timeline_empty: "Not enough data in this time range to build a timeline",
    timeline_y_count: "tweets",
    timeline_y_engagement: "engagement",
    milestone_label: "milestones",
    milestone_empty: "No clear milestone events detected",
    btn_gen_reply: "✨ Draft reply",
    btn_gen_reply_loading: "Drafting…",
    reply_user_question: "Draft a reply for @{handle}'s tweet",
  },
};

function getInitialLang() {
  const params = new URLSearchParams(window.location.search);
  const fromUrl = params.get("lang");
  if (fromUrl === "zh" || fromUrl === "en") return fromUrl;

  const fromLocalStorage = localStorage.getItem("welike_lang");
  if (fromLocalStorage === "zh" || fromLocalStorage === "en") return fromLocalStorage;

  const cookieMatch = document.cookie.match(/(?:^|;\s*)lang=(zh|en)(?:;|$)/);
  if (cookieMatch) return cookieMatch[1];

  return "zh";
}

let currentLang = getInitialLang();
function t(key) { return (I18N[currentLang] && I18N[currentLang][key]) ?? key; }

function applyI18n() {
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.dataset.i18n;
    if (I18N[currentLang][key] !== undefined) el.textContent = I18N[currentLang][key];
  });
  document.querySelectorAll("[data-i18n-html]").forEach(el => {
    const key = el.dataset.i18nHtml;
    if (I18N[currentLang][key] !== undefined) el.innerHTML = I18N[currentLang][key];
  });
  // Tooltip text on .info-tip elements
  document.querySelectorAll("[data-tip-i18n]").forEach(el => {
    const key = el.dataset.tipI18n;
    if (I18N[currentLang][key] !== undefined) el.dataset.tip = I18N[currentLang][key];
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
    const key = el.dataset.i18nPlaceholder;
    if (I18N[currentLang][key] !== undefined) el.placeholder = I18N[currentLang][key];
  });
  document.querySelectorAll("[data-i18n-title]").forEach(el => {
    const key = el.dataset.i18nTitle;
    if (I18N[currentLang][key] !== undefined) el.title = I18N[currentLang][key];
  });
  document.documentElement.lang = currentLang === "zh" ? "zh-CN" : "en";
  document.querySelectorAll(".lang-btn").forEach(b =>
    b.classList.toggle("active", b.dataset.lang === currentLang)
  );
  // Sync chat suggestion onclick prompts to current language
  document.querySelectorAll("#chatSuggestions .chip-sm").forEach(b => {
    const prompt = b.dataset[`prompt${currentLang === "zh" ? "Zh" : "En"}`];
    if (prompt) b.onclick = () => askSuggested(prompt);
  });
  // Update empty-state hint on the floating chat panel
  const cm = document.getElementById("chatMessages");
  if (cm) cm.dataset.empty = I18N[currentLang]["chat_empty_hint"] || "";
}

function scrollToChat() {
  const section = document.getElementById("chatSection");
  if (!section) return;
  section.scrollIntoView({ behavior: "smooth", block: "start" });
  // Focus the input after scroll settles
  setTimeout(() => $("chatInput")?.focus(), 350);
}

// Auto-hide the floating shortcut when the inline chat is already in view.
function setupChatFabAutoHide() {
  const fab = document.getElementById("chatFab");
  const section = document.getElementById("chatSection");
  if (!fab || !section || !("IntersectionObserver" in window)) return;
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Chat is visible — no need for the shortcut
          fab.classList.add("hide");
        } else if (currentTaskId) {
          // Chat scrolled out of view AND we have data → show shortcut
          fab.classList.remove("hide");
        }
        // If no analysis run yet, leave the FAB hidden (its initial state)
      });
    },
    { threshold: 0.15 }
  );
  io.observe(section);
}

// Cache last sentiment/category counts so we can rebuild charts on lang change
let lastChartData = null;

const REPORT_LANG_MARKER = /^<!--\s*welike-report-lang:(en|zh)\s*-->\s*/;

function inferReportLang(md) {
  const match = String(md || "").match(REPORT_LANG_MARKER);
  return match ? match[1] : null;
}

function stripReportLangMarker(md) {
  return String(md || "").replace(REPORT_LANG_MARKER, "");
}

function localizedField(obj, base) {
  if (!obj) return "";
  const suffix = currentLang === "en" ? "en" : "zh";
  return obj[`${base}_${suffix}`] || obj[base] || "";
}

function localizedTopicName(topic) {
  return localizedField(topic, "topic");
}

function localizedTopicAction(topic) {
  return localizedField(topic, "action");
}

function localizedTweetSummary(tweet) {
  return localizedField(tweet, "summary");
}

function setLang(lang) {
  if (!I18N[lang]) return;
  currentLang = lang;
  localStorage.setItem("welike_lang", lang);
  document.cookie = `lang=${lang}; path=/; max-age=${365 * 24 * 60 * 60}; SameSite=Lax`;
  applyI18n();
  // Re-render dynamic content that includes translated strings
  if (currentTopics.length) {
    renderTopics(currentTopics);
    renderTopicDetail(selectedTopicIdx);
  }
  if (allTweets.length) {
    const activeTab = document.querySelector("#categoryTabs .tab.active");
    applyFilter(activeTab ? activeTab.dataset.filter : "all");
  }
  // Charts have baked-in labels — recreate so legends translate
  if (lastChartData) {
    renderSentimentChart(lastChartData.pos, lastChartData.neg, lastChartData.neu);
    renderCategoryChart(lastChartData.cats);
  }
  if (lastTimelineData) {
    if (lastTimelineData.lang === currentLang) renderTimeline(lastTimelineData);
    else loadTimeline();
  }
  // Custom chat suggestions store both ZH/EN — re-render so the chip text follows lang
  if (lastSuggestions.length) {
    renderChatSuggestions(lastSuggestions);
  }
  if (currentReport || document.getElementById("reportContent")) {
    renderReport(currentReport);
  }
  if (lastDashboardData) {
    renderAlertCta(lastDashboardData);
  }
  // Refresh the alert preview so its sample sentence picks up the new language
  if (typeof updateAlertPreview === "function") updateAlertPreview();
}

// ===== State =====
let currentTaskId = null;
let pollTimer = null;
let allTweets = [];
let currentTopics = [];
let currentReport = "";
let currentReportLang = null;
let selectedTopicIdx = -1;
let sentimentChart = null;
let categoryChart = null;
let timelineChart = null;
let lastTimelineData = null;
let chatHistory = [];
let lastSuggestions = [];
let lastDashboardData = null;

// ===== View switching =====
document.querySelectorAll(".nav-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    const view = btn.dataset.view;
    document.querySelectorAll(".view").forEach(v => v.classList.add("hidden"));
    document.getElementById(`view-${view}`).classList.remove("hidden");
    if (view === "alerts") loadAlerts();
  });
});

// ===== UI helpers =====
const $ = id => document.getElementById(id);
const show = id => $(id).classList.remove("hidden");
const hide = id => $(id).classList.add("hidden");

// Backend sends Chinese progress strings; map them to English when in EN mode.
const BACKEND_MSG_EN = {
  "任务已创建": "Task created",
  "正在从 X 平台采集候选推文 (多页 relevancy + recency 双路)...": "Collecting candidate tweets from X (multi-page relevancy + recency dual pass)...",
  "正在判定情感、紧急度与建议动作...": "Scoring sentiment, urgency, and recommended actions...",
  "正在识别叙事与热点话题...": "Identifying narratives and hot topics...",
  "正在生成可执行的市场策略...": "Generating an executable market strategy...",
  "分析完成": "Analysis complete",
  "未找到相关推文": "No matching tweets found",
};

function translateBackendMsg(msg) {
  if (currentLang !== "en" || !msg) return msg;
  if (BACKEND_MSG_EN[msg]) return BACKEND_MSG_EN[msg];
  // Pattern: "已从 N 条候选中筛出 M 条最热推文 (top engagement=X)..."
  const m = msg.match(/已从 (\d+) 条候选中筛出 (\d+) 条最热推文 \(top engagement=(\d+)\)/);
  if (m) return `Picked top ${m[2]} hottest tweets from ${m[1]} candidates (top engagement=${m[3]})...`;
  // Pattern: "错误：..."
  if (msg.startsWith("错误：")) return "Error: " + msg.slice(3);
  return msg;
}

function setProgress(pct, msg) {
  $("progressBar").style.width = pct + "%";
  $("progressPct").textContent = pct + "%";
  $("progressMsg").textContent = translateBackendMsg(msg);
}

function fillExample(kw) { $("queryInput").value = kw; }

function resetUI() {
  hide("progressSection"); hide("dashboard"); hide("errorSection");
  $("analyzeBtn").disabled = false;
  $("btnText").textContent = t("btn_analyze");
  if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
  currentTaskId = null;
}

function escapeHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// ===== Start Analysis =====

async function readApiError(resp) {
  try {
    const data = await resp.clone().json();
    return data.error || data.message || `${t("server_error")} ${resp.status}`;
  } catch {
    try {
      const text = await resp.text();
      return text || `${t("server_error")} ${resp.status}`;
    } catch {
      return `${t("server_error")} ${resp.status}`;
    }
  }
}

async function startAnalysis() {
  const query = $("queryInput").value.trim();
  if (!query) { $("queryInput").focus(); return; }
  const timeRange = $("timeRange").value;

  hide("dashboard"); hide("errorSection");
  show("progressSection");
  setProgress(5, t("progress_connecting"));

  $("analyzeBtn").disabled = true;
  $("btnText").textContent = t("btn_analyzing");

  try {
    const resp = await fetch(`${API_BASE}/api/social-listening/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, time_range: timeRange, lang: currentLang }),
    });
    if (!resp.ok) throw new Error(await readApiError(resp));
    const data = await resp.json();
    currentTaskId = data.task_id;
    chatHistory = [];
    $("chatMessages").innerHTML = "";
    startPolling();
  } catch (err) {
    showError(t("err_no_backend") + escapeHtml(err.message));
  }
}

function startPolling() {
  pollTimer = setInterval(async () => {
    if (!currentTaskId) return;
    try {
      const resp = await fetch(`${API_BASE}/api/social-listening/status/${currentTaskId}`);
      const data = await resp.json();
      setProgress(data.progress, data.message);

      if (data.status === "done") {
        clearInterval(pollTimer);
        await loadReport(currentTaskId);
      } else if (data.status === "error") {
        clearInterval(pollTimer);
        showError(data.message);
      }
    } catch (err) {
      clearInterval(pollTimer);
      showError(t("err_polling") + err.message);
    }
  }, 1200);
}

async function loadReport(taskId) {
  const resp = await fetch(`${API_BASE}/api/social-listening/report/${taskId}`);
  const data = await resp.json();
  renderDashboard(data);
  hide("progressSection");
  show("dashboard");
  $("analyzeBtn").disabled = false;
  $("btnText").textContent = t("btn_reanalyze");
  // Reveal the floating chat shortcut now that there's data to ask about
  document.getElementById("chatFab")?.classList.remove("hide");
}

// ===== Render Dashboard =====

function asArray(value) {
  if (Array.isArray(value)) return value;
  if (value && typeof value === "object") return Object.values(value);
  return [];
}

function renderDashboard(data) {
  lastDashboardData = data;
  allTweets = asArray(data.tweets);
  currentTopics = asArray(data.topics).filter(topic => topic && typeof topic === "object");
  currentReport = data.report_markdown || "";
  currentReportLang = data.report_lang || inferReportLang(currentReport) || data.lang || null;
  selectedTopicIdx = -1;
  lastTimelineData = null;

  const sc = data.sentiment_counts || {};
  const uc = data.urgency_counts || {};
  const total = data.tweet_count || 1;
  const pos = sc.positive || 0, neg = sc.negative || 0, neu = sc.neutral || 0;

  $("statTotal").textContent = data.tweet_count;
  $("statPos").textContent = Math.round(pos / total * 100);
  $("statNeg").textContent = Math.round(neg / total * 100);
  $("statNeu").textContent = Math.round(neu / total * 100);
  $("statUrgent").textContent = uc.high || 0;

  lastChartData = { pos, neg, neu, cats: data.category_counts || {} };
  renderSentimentChart(pos, neg, neu);
  renderCategoryChart(data.category_counts || {});
  renderTopics(currentTopics);
  renderTopicDetail(-1);
  renderTweets(allTweets);
  renderReport(currentReport);
  lastSuggestions = generateChatSuggestions(data);
  renderChatSuggestions(lastSuggestions);
  wireTabs();
  renderAlertCta(data);
  // Heat & Milestones only makes sense for 7d/14d windows — 24h doesn't have
  // enough day-buckets to draw a meaningful trend or infer milestones.
  const tlCard = document.querySelector(".timeline-card");
  if (data.time_range === "24h") {
    if (tlCard) tlCard.classList.add("hidden");
  } else {
    if (tlCard) tlCard.classList.remove("hidden");
    loadTimeline();
  }
}

// ===== Charts =====

function renderSentimentChart(pos, neg, neu) {
  const ctx = $("sentimentChart").getContext("2d");
  if (sentimentChart) sentimentChart.destroy();
  sentimentChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: [sentLabel("positive"), sentLabel("negative"), sentLabel("neutral")],
      datasets: [{
        data: [pos, neg, neu],
        backgroundColor: ["#06F5B7", "#FF5C7A", "#8B9AFF"],
        borderColor: "#0e0e0e",
        borderWidth: 3,
        hoverOffset: 8,
      }],
    },
    options: {
      plugins: {
        legend: { position: "bottom", labels: { color: "#8a8a8a", font: { family: "JetBrains Mono", size: 11 }, padding: 14 } },
      },
      cutout: "68%",
    },
  });
}

const CATEGORY_KEYS = ["key_voice", "feature_request", "bug_issue", "competitor", "general"];
const CATEGORY_COLORS = {
  key_voice: "#06F5B7",
  feature_request: "#8B9AFF",
  bug_issue: "#FF5C7A",
  competitor: "#FFB74D",
  general: "#666666",
};

function renderCategoryChart(counts) {
  const ctx = $("categoryChart").getContext("2d");
  if (categoryChart) categoryChart.destroy();
  const keys = CATEGORY_KEYS;
  const data = keys.map(k => counts[k] || 0);
  categoryChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: keys.map(catLabel),
      datasets: [{
        data,
        backgroundColor: keys.map(k => CATEGORY_COLORS[k] + "cc"),
        borderColor: keys.map(k => CATEGORY_COLORS[k]),
        borderWidth: 1,
        borderRadius: 6,
      }],
    },
    options: {
      indexAxis: "y",
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: "#8a8a8a", font: { family: "JetBrains Mono", size: 10 } }, grid: { color: "#1a1a1a" } },
        y: { ticks: { color: "#f5f5f5", font: { family: "JetBrains Mono", size: 10 } }, grid: { display: false } },
      },
    },
  });
}

// ===== Topic Explorer =====

function renderTopics(topics) {
  const list = $("topicsList");
  topics = asArray(topics);
  if (!topics.length) {
    list.innerHTML = `<span class="muted">${t("no_topics")}</span>`;
    return;
  }
  list.innerHTML = topics.map((topic, idx) => `
    <div class="topic-item ${idx === selectedTopicIdx ? 'selected' : ''}" onclick="selectTopic(${idx})">
      <div class="topic-head">
        <div class="topic-meta-tags">
          <span class="tag urgency-${escapeHtml(topic.urgency)}">${urgLabel(topic.urgency)}</span>
          <span class="tag sent-${escapeHtml(topic.sentiment)}">${sentLabel(topic.sentiment)}</span>
        </div>
        <span class="topic-post-count mono">${topic.tweet_ids?.length || topic.count || 0} ${t("unit_count")}</span>
      </div>
      <div class="topic-name">${escapeHtml(localizedTopicName(topic))}</div>
      <div class="topic-action">${escapeHtml(localizedTopicAction(topic))}</div>
    </div>
  `).join("");
}

function selectTopic(idx) {
  selectedTopicIdx = idx;
  renderTopics(currentTopics);
  renderTopicDetail(idx);
}

function renderTopicDetail(idx) {
  const box = $("topicDetail");
  if (idx < 0 || !currentTopics[idx]) {
    box.innerHTML = `
      <div class="topic-detail-empty">
        <div class="empty-icon">◎</div>
        <p>${t("topic_empty")}</p>
      </div>`;
    return;
  }
  const topic = currentTopics[idx];
  const tweetIds = (topic.tweet_ids || []).filter(i => i >= 1 && i <= allTweets.length);
  const topicTweets = tweetIds.map(i => ({ tweet: allTweets[i - 1], origIdx: i - 1 }));

  const tweetsHTML = topicTweets.length
    ? topicTweets.map(({ tweet, origIdx }) => renderTopicTweetCard(tweet, origIdx)).join("")
    : `<div class="muted" style="padding:20px;text-align:center">${t("topic_no_tweets")}</div>`;

  box.innerHTML = `
    <div class="topic-detail-head">
      <div class="topic-detail-tags">
        <span class="tag urgency-${escapeHtml(topic.urgency)}">${urgLabel(topic.urgency)}${t("topic_urgency_suffix")}</span>
        <span class="tag sent-${escapeHtml(topic.sentiment)}">${sentLabel(topic.sentiment)}</span>
        <span class="tag">${tweetIds.length} ${t("topic_driving_tweets_count")}</span>
      </div>
      <h2 class="topic-detail-title">${escapeHtml(localizedTopicName(topic))}</h2>
      <div class="topic-detail-action"><strong>${t("topic_overall_advice")}</strong>${escapeHtml(localizedTopicAction(topic))}</div>
    </div>
    <div class="topic-detail-tweets">${tweetsHTML}</div>
  `;
}

function renderTopicTweetCard(t, origIdx) {
  const sent = t.sentiment || "neutral";
  const urg = t.urgency || "low";
  const ttype = t.tweet_type || "tweet";
  return `
    <div class="td-tweet">
      <div class="td-tweet-head">
        <div class="td-author">
          <span class="td-author-name">@${escapeHtml(t.author_username)}</span>
          ${t.author_verified ? '<span class="voice-verified">✓</span>' : ''}
          <span class="td-followers mono">${(t.author_followers||0).toLocaleString()} ${t_("followers_suffix")}</span>
        </div>
        <div class="badges">
          <span class="badge type-${ttype}">${typeLabel(ttype)}</span>
          <span class="badge sent-${sent}">${sentLabel(sent)}</span>
          <span class="badge urg-${urg}">${urgLabel(urg)}</span>
        </div>
      </div>
      <div class="td-tweet-text">${escapeHtml(t.text)}</div>
      <div class="td-tweet-meta mono">
        <span title="replies">${ICON.reply} ${(t.replies||0).toLocaleString()}</span>
        <span title="retweets">${ICON.retweet} ${(t.retweets||0).toLocaleString()}</span>
        <span title="likes">${ICON.like} ${(t.likes||0).toLocaleString()}</span>
        ${t.bookmarks ? `<span title="bookmarks" class="meta-strong">${ICON.bookmark} ${t.bookmarks.toLocaleString()}</span>` : ""}
        ${t.impressions ? `<span title="views">${ICON.views} ${formatCount(t.impressions)}</span>` : ""}
        <span class="hot-score mono" title="hot score">🔥 ${(t.engagement||0).toLocaleString()}</span>
        ${t.lang ? `<span>· ${escapeHtml(t.lang)}</span>` : ""}
        ${t.url ? `<a href="${t.url}" target="_blank" rel="noopener">${currentLang === "zh" ? "原文" : "View"} ↗</a>` : ""}
      </div>
      <div class="td-tweet-action">
        <div class="td-action-pill">
          <span class="td-action-label mono">${t_("suggested_action_label")}</span>
          <strong>${actionLabel(t.action) || actionLabel("monitor")}</strong>
        </div>
        ${localizedTweetSummary(t) ? `<div class="td-action-why">${escapeHtml(localizedTweetSummary(t))}</div>` : ""}
        ${t.action === "reply_now" ? `<button class="reply-gen-btn" onclick="requestReply(${origIdx}, this)">${t_("btn_gen_reply")}</button>` : ""}
      </div>
    </div>
  `;
}

// alias to avoid shadowing the per-tweet `t` parameter inside renderTopicTweetCard
function t_(k) { return t(k); }

// ===== Tweets =====

function wireTabs() {
  document.querySelectorAll("#categoryTabs .tab").forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll("#categoryTabs .tab").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      applyFilter(btn.dataset.filter);
    };
  });
}

function applyFilter(filter) {
  let filtered = allTweets;
  if (filter !== "all") {
    const [k, v] = filter.split(":");
    if (k === "cat") filtered = allTweets.filter(t => t.category === v);
    if (k === "sent") filtered = allTweets.filter(t => t.sentiment === v);
  }
  renderTweets(filtered);
}

// Helpers that always read the current language
const catLabel = (k) => t(`cat_${k}`) || k;
const sentLabel = (k) => t(`sent_${k}`) || k;
const urgLabel = (k) => t(`urg_${k}`) || k;
const actionLabel = (k) => t(`action_${k}`) || k;
const typeLabel = (k) => t(`type_${k}`) || k;

// Twitter-style line icons (Feather-inspired, stroke-only so they inherit color/size).
const SVG_ATTRS = 'viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px"';
const ICON = {
  reply:    `<svg ${SVG_ATTRS}><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>`,
  retweet:  `<svg ${SVG_ATTRS}><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>`,
  like:     `<svg ${SVG_ATTRS}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
  bookmark: `<svg ${SVG_ATTRS}><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>`,
  views:    `<svg ${SVG_ATTRS}><line x1="6" y1="20" x2="6" y2="14"/><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="6"/></svg>`,
};

function renderTweets(tweets) {
  const feed = $("tweetFeed");
  if (!tweets || !tweets.length) {
    feed.innerHTML = `<div class="muted" style="text-align:center;padding:30px">${t("no_tweets")}</div>`;
    return;
  }
  feed.innerHTML = tweets.map((t) => {
    const origIdx = allTweets.indexOf(t);
    const sent = t.sentiment || "neutral";
    const cat = t.category || "general";
    const urg = t.urgency || "low";
    const ttype = t.tweet_type || "tweet";
    const viewLabel = currentLang === "zh" ? "原文" : "View";
    return `
      <div class="tweet-item ${sent}" id="tweet-${origIdx}">
        <div class="tweet-header">
          <div>
            <span class="tweet-author">@${escapeHtml(t.author_username)}</span>
            <span class="tweet-followers">${(t.author_followers||0).toLocaleString()} ${t_("followers_suffix")}</span>
          </div>
          <div class="badges">
            <span class="badge type-${ttype}">${typeLabel(ttype)}</span>
            <span class="badge sent-${sent}">${sentLabel(sent)}</span>
            <span class="badge cat">${catLabel(cat)}</span>
            <span class="badge urg-${urg}">${urgLabel(urg)}</span>
          </div>
        </div>
        <div class="tweet-text">${escapeHtml(t.text)}</div>
        ${localizedTweetSummary(t) ? `<div class="tweet-summary">📌 ${escapeHtml(localizedTweetSummary(t))}</div>` : ""}
        <div class="tweet-action-line">
          <span>${t_("suggested_action_inline")}<strong>${actionLabel(t.action) || actionLabel("monitor")}</strong></span>
          ${t.action === "reply_now" ? `<button class="reply-gen-btn" onclick="requestReply(${origIdx}, this)">${t_("btn_gen_reply")}</button>` : ""}
        </div>
        <div class="tweet-meta">
          <span title="replies">${ICON.reply} ${(t.replies||0).toLocaleString()}</span>
          <span title="retweets">${ICON.retweet} ${(t.retweets||0).toLocaleString()}</span>
          <span title="likes">${ICON.like} ${(t.likes||0).toLocaleString()}</span>
          ${t.bookmarks ? `<span title="bookmarks" class="meta-strong">${ICON.bookmark} ${t.bookmarks.toLocaleString()}</span>` : ""}
          ${t.impressions ? `<span title="views">${ICON.views} ${formatCount(t.impressions)}</span>` : ""}
          <span class="hot-score mono" title="weighted engagement score">🔥 ${(t.engagement||0).toLocaleString()}</span>
          ${t.lang ? `<span>· ${escapeHtml(t.lang)}</span>` : ""}
          <span>${t.created_at ? t.created_at.slice(0, 10) : ""}</span>
          ${t.url ? `<a href="${t.url}" target="_blank" rel="noopener">${viewLabel} ↗</a>` : ""}
        </div>
      </div>`;
  }).join("");
}

function formatCount(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toString();
}

function scrollToTweet(origIdx) {
  // Reset filter to "all" so the tweet is in DOM
  document.querySelectorAll("#categoryTabs .tab").forEach(b => b.classList.remove("active"));
  document.querySelector("#categoryTabs .tab[data-filter=all]").classList.add("active");
  renderTweets(allTweets);
  setTimeout(() => {
    const el = $(`tweet-${origIdx}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("flash");
      setTimeout(() => el.classList.remove("flash"), 1200);
    }
  }, 50);
}

// ===== Report =====
// On-demand generation: the analysis pipeline no longer auto-runs the
// Strategy Report (the most expensive single LLM call). Users see a CTA
// describing what the report will contain; only clicking "确认生成" fires
// the API call.

function renderReport(md) {
  const box = $("reportContent");
  if (!box) return;
  const reportLang = currentReportLang || inferReportLang(md);
  if (md && md.trim() && (!reportLang || reportLang === currentLang)) {
    box.innerHTML = marked.parse(stripReportLangMarker(md));
    setExportButtonsEnabled(true);
    return;
  }
  // Empty → show CTA
  setExportButtonsEnabled(false);
  box.innerHTML = renderReportCta();
  // Wire the click — done after innerHTML so the button exists
  const btn = box.querySelector("#generateReportBtn");
  if (btn) btn.onclick = () => requestReportGeneration();
}

function renderReportCta() {
  const isZh = currentLang === "zh";
  if (isZh) {
    return `
      <div class="report-cta">
        <div class="report-cta-icon">📊</div>
        <h4 class="report-cta-title">按需生成市场策略报告</h4>
        <p class="report-cta-desc">
          基于本次 <strong>${allTweets.length} 条推文</strong> 输出一份结构化策略报告：风险信号、话题拆解、1 周 / 1 月行动计划。
        </p>
        <p class="report-cta-meta muted">预计耗时 ~30 秒</p>
        <button class="pill-btn primary" id="generateReportBtn">✨ 确认生成</button>
      </div>
    `;
  }
  return `
    <div class="report-cta">
      <div class="report-cta-icon">📊</div>
      <h4 class="report-cta-title">Generate strategy report on demand</h4>
      <p class="report-cta-desc">
        Based on this run's <strong>${allTweets.length} tweets</strong>, the AI outputs a structured strategy report: risk signals, topic deep-dive, and a 1-week / 1-month action plan.
      </p>
      <p class="report-cta-meta muted">~30s to generate</p>
      <button class="pill-btn primary" id="generateReportBtn">✨ Generate report</button>
    </div>
  `;
}

function setExportButtonsEnabled(enabled) {
  document.querySelectorAll(".report-card .export-btns .pill-btn").forEach(b => {
    b.disabled = !enabled;
    b.style.opacity = enabled ? "" : "0.45";
    b.style.pointerEvents = enabled ? "" : "none";
  });
}

async function requestReportGeneration() {
  if (!currentTaskId) { alert(t("err_run_first")); return; }
  const box = $("reportContent");
  if (box) {
    box.innerHTML = `
      <div class="report-cta">
        <div class="report-cta-spinner"></div>
        <p>${currentLang === "zh" ? "正在生成报告… 这可能需要 30 秒左右" : "Generating report — this may take ~30s"}</p>
      </div>
    `;
  }
  try {
    const resp = await fetch(`${API_BASE}/api/social-listening/report/${currentTaskId}/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lang: currentLang }),
    });
    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      throw new Error(err.detail || `HTTP ${resp.status}`);
    }
    const data = await resp.json();
    currentReport = data.report_markdown || "";
    currentReportLang = data.report_lang || inferReportLang(currentReport) || currentLang;
    renderReport(currentReport);
  } catch (err) {
    if (box) {
      box.innerHTML = `<div class="report-cta"><p class="neg">${t("err_unknown")}${escapeHtml(err.message)}</p>
        <button class="pill-btn" id="generateReportBtn">${currentLang === "zh" ? "重试" : "Retry"}</button></div>`;
      const retry = box.querySelector("#generateReportBtn");
      if (retry) retry.onclick = () => requestReportGeneration();
    }
  }
}

async function exportMarkdown() {
  if (!currentTaskId) return;
  if (!currentReport) {
    alert(currentLang === "zh" ? "请先点击「确认生成」生成报告" : "Please click \"Generate report\" first");
    return;
  }
  const a = document.createElement("a");
  a.href = `${API_BASE}/api/social-listening/export/${currentTaskId}/markdown`;
  a.download = "welike_report.md";
  a.click();
}

function printReport() {
  if (!currentReport) {
    alert(t("err_run_first"));
    return;
  }
  const lang = currentLang === "zh" ? "zh-CN" : "en";
  const title = (lastChartData && currentTaskId)
    ? `WeLike ${currentLang === "zh" ? "社交聆听报告" : "Strategy Report"}`
    : "WeLike Strategy Report";
  const w = window.open("", "_blank");
  if (!w) { alert("Pop-up blocked. Please allow pop-ups and try again."); return; }
  const renderedHtml = marked.parse(stripReportLangMarker(currentReport));
  w.document.write(`<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    @page { margin: 18mm; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC",
                   "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
      max-width: 760px;
      margin: 0 auto;
      padding: 24px;
      line-height: 1.75;
      color: #1a1a1a;
      font-size: 14px;
    }
    h1 {
      color: #06a17a;
      font-size: 1.6rem;
      border-bottom: 2px solid #06a17a;
      padding-bottom: 10px;
      margin: 16px 0 14px;
    }
    h2 {
      color: #06a17a;
      font-size: 1.2rem;
      margin: 26px 0 10px;
      page-break-after: avoid;
    }
    h3 { color: #1a1a1a; font-size: 1.05rem; margin: 16px 0 8px; }
    p { margin-bottom: 10px; }
    ul, ol { padding-left: 22px; margin-bottom: 12px; }
    li { margin-bottom: 6px; }
    strong { color: #06a17a; font-weight: 600; }
    em { color: #555; font-style: italic; }
    code {
      background: #f5f5f5;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: ui-monospace, "SF Mono", Menlo, monospace;
      font-size: 0.9em;
    }
    blockquote {
      border-left: 3px solid #06a17a;
      padding-left: 14px;
      color: #555;
      margin: 12px 0;
    }
    hr { border: none; border-top: 1px solid #ddd; margin: 18px 0; }
    table { border-collapse: collapse; margin: 10px 0; }
    th, td { border: 1px solid #ddd; padding: 6px 10px; text-align: left; }
    th { background: #f5f5f5; }
  </style>
</head>
<body>
  ${renderedHtml}
</body>
</html>`);
  w.document.close();
  // Give the new window a tick to render before printing
  setTimeout(() => { w.focus(); w.print(); }, 250);
}

function showError(msg) {
  hide("progressSection");
  $("errorMsg").innerHTML = msg;
  show("errorSection");
  $("analyzeBtn").disabled = false;
  $("btnText").textContent = t("btn_analyze");
}

// ===== Smart Alerts CTA on the analysis dashboard =====
// Shows a contextual card AFTER the strategy report that converts the just-finished
// analysis into a recurring alert. Pre-fills handle/keywords/filters from the data.

const ALERT_CTA_DISMISS_PREFIX = "welike_cta_dismiss_";
let pendingCtaPrefill = null; // applied when alertCreateBox becomes visible

// Try to extract a single X handle from the user's query string. Accepts:
//   "@AnthropicAI"      → "AnthropicAI"
//   "https://x.com/AnthropicAI" / "twitter.com/AnthropicAI" → "AnthropicAI"
//   anything else       → null (treat as keyword instead)
function _extractHandleFromQuery(q) {
  if (!q) return null;
  const s = q.trim();
  const url = s.match(/(?:x|twitter)\.com\/([A-Za-z0-9_]{1,15})\b/i);
  if (url) return url[1];
  const at = s.match(/^@([A-Za-z0-9_]{1,15})$/);
  if (at) return at[1];
  return null;
}

function _ctaSuggestPrefill(data) {
  const query = (data && data.query) || "";
  const sc = data?.sentiment_counts || {};
  const uc = data?.urgency_counts || {};

  const handle = _extractHandleFromQuery(query);
  const keywords = handle ? [] : (query ? [query.split(/\s+/)[0]] : []);

  // Sentiment defaults: pick the one(s) with meaningful volume
  const sentiments = [];
  if ((sc.negative || 0) > 0) sentiments.push("negative");
  if ((sc.neutral || 0) >= (sc.negative || 0)) sentiments.push("neutral");
  if (!sentiments.length) sentiments.push("negative"); // fallback

  // Urgency: high if there's anything urgent, otherwise high+medium
  const urgencies = [];
  if ((uc.high || 0) > 0) urgencies.push("high");
  if ((uc.medium || 0) > 0 && urgencies.length === 0) urgencies.push("medium");
  if (!urgencies.length) urgencies.push("high");

  return {
    query, handle, keywords, sentiments, urgencies,
    urgentN: uc.high || 0,
    negativeN: sc.negative || 0,
    totalN: data?.tweet_count || 0,
  };
}

function renderAlertCta(data) {
  const card = $("alertCtaCard");
  if (!card) return;

  // Hide if user dismissed for this query, or if they already have an alert
  const query = (data && data.query) || "";
  const dismissKey = ALERT_CTA_DISMISS_PREFIX + query.toLowerCase().trim();
  if (localStorage.getItem(dismissKey)) { card.classList.add("hidden"); return; }
  if (currentAlert) { card.classList.add("hidden"); return; }

  const p = _ctaSuggestPrefill(data);

  // Description with live numbers from the analysis
  const focusLabel = p.handle ? `<strong>@${escapeHtml(p.handle)}</strong>` : `<strong>「${escapeHtml(p.query)}」</strong>`;
  const desc = $("alertCtaDesc");
  const isZh = currentLang === "zh";
  if (isZh) {
    const parts = [];
    parts.push(`本次分析里 ${focusLabel} 共 <strong>${p.totalN} 条推文</strong>`);
    if (p.urgentN > 0) parts.push(`其中 <span class="warn">${p.urgentN} 条紧急</span>`);
    if (p.negativeN > 0) parts.push(`<span class="neg">${p.negativeN} 条消极声音</span>`);
    desc.innerHTML = parts.join("、") + "。<br>创建 Smart Alert，新出现的高紧急度推文会立即推送到你的 Telegram，避免错过下一次舆情风暴。";
  } else {
    const parts = [];
    parts.push(`This run picked up <strong>${p.totalN} tweets</strong> for ${focusLabel}`);
    if (p.urgentN > 0) parts.push(`<span class="warn">${p.urgentN} urgent</span>`);
    if (p.negativeN > 0) parts.push(`<span class="neg">${p.negativeN} negative</span>`);
    desc.innerHTML = parts.join(" · ") + ".<br>Create a Smart Alert and any new high-urgency tweet will be pushed to your Telegram in real time.";
  }

  // Prefill chips
  const handleChip = $("ctaHandleChip");
  if (p.handle) {
    handleChip.textContent = "@" + p.handle;
    handleChip.classList.remove("muted");
  } else if (p.keywords.length) {
    handleChip.textContent = p.keywords[0];
  } else {
    handleChip.textContent = isZh ? "(待填)" : "(to fill)";
  }

  const sentLabels = { negative: ["neg", "消极", "negative"], positive: ["pos", "积极", "positive"], neutral: ["neu", "中性", "neutral"] };
  $("ctaSentChips").innerHTML = p.sentiments.map(s => {
    const [cls, zh, en] = sentLabels[s];
    return `<span class="prefill-chip ${cls}">${isZh ? zh : en}</span>`;
  }).join("");

  const urgLabels = { high: ["warn", "🚨 高", "🚨 high"], medium: ["warn", "⚠️ 中", "⚠️ medium"], low: ["neu", "🔵 低", "🔵 low"] };
  $("ctaUrgChips").innerHTML = p.urgencies.map(u => {
    const [cls, zh, en] = urgLabels[u];
    return `<span class="prefill-chip ${cls}">${isZh ? zh : en}</span>`;
  }).join("");

  // Mini Telegram preview
  $("ctaTgProject").textContent = p.handle ? "@" + p.handle : (p.keywords[0] || "@your_handle");
  const trio = [];
  const primarySent = p.sentiments[0];
  if (primarySent === "negative") trio.push(`<span class="tg-tag neg">🔴 ${isZh ? "消极" : "negative"}</span>`);
  else if (primarySent === "positive") trio.push(`<span class="tg-tag pos">🟢 ${isZh ? "积极" : "positive"}</span>`);
  else if (primarySent === "neutral") trio.push(`<span class="tg-tag neu">⚪ ${isZh ? "中性" : "neutral"}</span>`);
  const primaryUrg = p.urgencies[0];
  if (primaryUrg === "high") trio.push(`<span class="tg-tag high">🚨 ${isZh ? "高" : "high"}</span>`);
  else if (primaryUrg === "medium") trio.push(`<span class="tg-tag med">⚠️ ${isZh ? "中" : "medium"}</span>`);
  else trio.push(`<span class="tg-tag neu">🔵 ${isZh ? "低" : "low"}</span>`);
  trio.push(`<span class="tg-tag">💬 ${isZh ? "立即回复" : "Reply now"}</span>`);
  $("ctaTgTrio").innerHTML = trio.join("");
  // Sample bubble body — same template builder we use for the live preview
  const sample = buildPreviewSentence(
    p.handle ? [p.handle] : [],
    p.keywords,
    currentLang,
  );
  $("ctaTgBody").innerHTML = sample.html;
  // Live wall-clock
  const d = new Date();
  $("ctaTgClock").textContent =
    `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;

  // Wire buttons (clean any previous)
  const createBtn = $("ctaCreateBtn");
  const dismissBtn = $("ctaDismissBtn");
  createBtn.onclick = () => applyAlertCtaPrefill(p);
  dismissBtn.onclick = () => {
    localStorage.setItem(dismissKey, "1");
    card.classList.add("hidden");
  };

  card.classList.remove("hidden");
}

// Pivot to the alerts view and pre-fill the create form with this analysis.
// If the user hasn't connected Telegram yet, we still navigate them to the
// alerts page (they'll see the connect prompt) and stash the prefill so it
// gets applied as soon as they finish linking.
function applyAlertCtaPrefill(prefill) {
  pendingCtaPrefill = prefill;
  // Activate the alerts nav button → triggers the existing view-switching wiring
  const navBtn = document.querySelector('.nav-btn[data-view="alerts"]');
  if (navBtn) navBtn.click();
  else {
    // Fallback if nav-btn-click handler isn't bound yet
    document.querySelectorAll(".view").forEach(v => v.classList.add("hidden"));
    document.getElementById("view-alerts").classList.remove("hidden");
    loadAlerts();
  }
  // Apply the prefill on next tick (after view is shown)
  setTimeout(maybeApplyPendingCtaPrefill, 200);
}

function maybeApplyPendingCtaPrefill() {
  if (!pendingCtaPrefill) return;
  const createBox = $("alertCreateBox");
  if (!createBox || createBox.classList.contains("hidden")) {
    // Form not visible yet (e.g. user still on connect-card). Try again later.
    setTimeout(maybeApplyPendingCtaPrefill, 400);
    return;
  }
  const p = pendingCtaPrefill;
  pendingCtaPrefill = null; // consume

  // Tags
  if (p.handle) setTags("alertHandles", [p.handle]);
  if (p.keywords.length) setTags("alertKeywords", p.keywords);

  // Sentiment checkboxes — uncheck all then check requested
  document.querySelectorAll('input[name="sentiment_filter"]').forEach(c => c.checked = false);
  p.sentiments.forEach(s => {
    const el = document.querySelector(`input[name="sentiment_filter"][value="${s}"]`);
    if (el) el.checked = true;
  });

  // Urgency checkboxes
  document.querySelectorAll('input[name="urgency_filter"]').forEach(c => c.checked = false);
  p.urgencies.forEach(u => {
    const el = document.querySelector(`input[name="urgency_filter"][value="${u}"]`);
    if (el) el.checked = true;
  });

  if (typeof updateAlertPreview === "function") updateAlertPreview();
  if (typeof updateCreateBtnState === "function") updateCreateBtnState();
  createBox.scrollIntoView({ behavior: "smooth", block: "start" });
}

// ===== Chat suggestions (data-driven) =====

// Pick chat-suggestion chips based on the actual analysis, so prompts
// reference real numbers, real handles, and real topics from this run.
function generateChatSuggestions(data) {
  const cat = data.category_counts || {};
  const urg = data.urgency_counts || {};
  const sent = data.sentiment_counts || {};
  const topics = asArray(data.topics);
  const tweets = asArray(data.tweets);

  const candidates = [];

  // 1. Urgent-first — single most actionable lever for ops/PM teams
  const urgentN = urg.high || 0;
  if (urgentN > 0) {
    candidates.push({
      priority: 100,
      labelZh: `🚨 紧急 ${urgentN} 条`,
      labelEn: `🚨 ${urgentN} urgent`,
      promptZh: `当前最紧急的 ${urgentN} 条推文是什么？请逐条给出具体的回复话术或处理动作`,
      promptEn: `What are the ${urgentN} most urgent tweets right now? Give a concrete reply or action for each`,
    });
  }

  // 2. Top topic — drill into the dominant narrative
  const topTopic = topics[0];
  if (topTopic && localizedTopicName(topTopic)) {
    const topicZh = topTopic.topic_zh || topTopic.topic || localizedTopicName(topTopic);
    const topicEn = topTopic.topic_en || topTopic.topic || localizedTopicName(topTopic);
    const shortZh = topicZh.length > 12 ? topicZh.slice(0, 12) + "…" : topicZh;
    const shortEn = topicEn.length > 18 ? topicEn.slice(0, 18) + "…" : topicEn;
    candidates.push({
      priority: 90,
      labelZh: `📊 拆解「${shortZh}」`,
      labelEn: `📊 Dig into "${shortEn}"`,
      promptZh: `深入拆解话题「${topicZh}」：成因是什么？哪些声音在推动？给出 3 条具体应对建议`,
      promptEn: `Deep-dive on the topic "${topicEn}": what's driving it, who is amplifying it, and 3 concrete actions`,
    });
  }

  // 3. Bug pile — concrete fix queue
  const bugN = cat.bug_issue || 0;
  if (bugN >= 2) {
    candidates.push({
      priority: 85,
      labelZh: `🐛 ${bugN} 条 Bug`,
      labelEn: `🐛 ${bugN} bug reports`,
      promptZh: `把 ${bugN} 条 Bug/投诉按重复频次和严重度排序，哪些是产品必须立刻修的？`,
      promptEn: `Sort the ${bugN} bug/complaint tweets by frequency and severity. Which must be fixed immediately?`,
    });
  }

  // 4. Feature requests — product backlog signal
  const featN = cat.feature_request || 0;
  if (featN >= 2) {
    candidates.push({
      priority: 75,
      labelZh: `💡 ${featN} 条功能建议`,
      labelEn: `💡 ${featN} feature asks`,
      promptZh: `归类整理 ${featN} 条功能建议，标注呼声最高的 3 个，并给出实现优先级评估`,
      promptEn: `Group the ${featN} feature requests, flag the top 3 by demand, and rank implementation priority`,
    });
  }

  // 5. Competitor mentions — positioning angle
  const compN = cat.competitor || 0;
  if (compN >= 1) {
    candidates.push({
      priority: 70,
      labelZh: `🥊 ${compN} 条竞品提及`,
      labelEn: `🥊 ${compN} competitor mentions`,
      promptZh: `推文中具体提到了哪些竞品？我们相对它们的优势和差距各是什么？`,
      promptEn: `Which competitors are explicitly mentioned? Where do we lead, where do we lag?`,
    });
  }

  // 6. Top key voice — name a specific influential handle
  const keyVoice = tweets.find(t => t.category === "key_voice");
  if (keyVoice && keyVoice.author_username) {
    candidates.push({
      priority: 65,
      labelZh: `🎙 @${keyVoice.author_username} 怎么互动`,
      labelEn: `🎙 Engage @${keyVoice.author_username}`,
      promptZh: `@${keyVoice.author_username} 这条声音值得回复吗？给一份 reply 草稿，并说明回复的目的`,
      promptEn: `Is @${keyVoice.author_username}'s voice worth a reply? Draft one and explain the goal`,
    });
  }

  // 7. Negative root cause — fallback when there's negative pressure
  const negN = sent.negative || 0;
  if (negN >= 3) {
    candidates.push({
      priority: 60,
      labelZh: `❌ ${negN} 条消极根因`,
      labelEn: `❌ ${negN} negatives — root cause`,
      promptZh: `消极声音的核心原因是什么？分类汇总，并给出公关回应模板`,
      promptEn: `What's the root cause behind the negative voices? Group them and give a PR response template`,
    });
  }

  // Sort by priority, take 4 — keeps the chip row visually balanced
  return candidates.sort((a, b) => b.priority - a.priority).slice(0, 4);
}

function renderChatSuggestions(suggestions) {
  const box = $("chatSuggestions");
  if (!box) return;
  if (!suggestions || !suggestions.length) {
    box.innerHTML = "";
    return;
  }
  const isZh = currentLang === "zh";
  box.innerHTML = suggestions.map((s, i) => {
    const label = isZh ? s.labelZh : s.labelEn;
    return `<button class="chip-sm" data-suggest-idx="${i}">${escapeHtml(label)}</button>`;
  }).join("");
  box.querySelectorAll(".chip-sm").forEach(btn => {
    const idx = +btn.dataset.suggestIdx;
    const s = suggestions[idx];
    btn.onclick = () => askSuggested(isZh ? s.promptZh : s.promptEn);
  });
}

// ===== Chat =====

async function sendChat() {
  const inp = $("chatInput");
  const q = inp.value.trim();
  if (!q || !currentTaskId) return;

  appendChat("user", q);
  inp.value = "";
  $("chatSendBtn").disabled = true;
  const thinkingId = appendChat("assistant", t("chat_thinking"));

  try {
    const resp = await fetch(`${API_BASE}/api/social-listening/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ task_id: currentTaskId, question: q, history: chatHistory, lang: currentLang }),
    });
    const data = await resp.json();
    replaceChat(thinkingId, "assistant", data.answer || t("chat_empty_reply"));
    chatHistory.push({ role: "user", content: q });
    chatHistory.push({ role: "assistant", content: data.answer });
  } catch (err) {
    replaceChat(thinkingId, "assistant", t("err_unknown") + err.message);
  } finally {
    $("chatSendBtn").disabled = false;
  }
}

function askSuggested(q) {
  if (!currentTaskId) { alert(t("err_run_first")); return; }
  $("chatInput").value = q;
  sendChat();
}

let chatMsgCounter = 0;
function appendChat(role, content) {
  const box = $("chatMessages");
  const id = `chat-msg-${++chatMsgCounter}`;
  const div = document.createElement("div");
  div.className = `chat-msg ${role}`;
  div.id = id;
  div.innerHTML = role === "assistant" ? marked.parse(content) : escapeHtml(content);
  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
  return id;
}
function replaceChat(id, role, content) {
  const el = $(id);
  if (!el) return;
  el.className = `chat-msg ${role}`;
  el.innerHTML = role === "assistant" ? marked.parse(content) : escapeHtml(content);
  $("chatMessages").scrollTop = $("chatMessages").scrollHeight;
}

// ===== Engagement timeline + milestones =====
//
// One backend call per task (server caches). Renders a Chart.js line of daily
// tweet count + engagement, with vertical annotations for AI-inferred milestones.
// Hover/click a milestone to see what drove the spike.

async function loadTimeline() {
  if (!currentTaskId) return;
  const empty = $("timelineEmpty");
  const wrap = $("timelineWrap");
  if (empty) empty.textContent = t("timeline_loading");
  empty?.classList.remove("hidden");
  wrap?.classList.add("hidden");
  try {
    const resp = await fetch(`${API_BASE}/api/social-listening/timeline/${currentTaskId}?lang=${currentLang}`);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();
    renderTimeline(data);
  } catch (err) {
    if (empty) empty.textContent = t("timeline_empty") + " (" + err.message + ")";
  }
}

function renderTimeline(data) {
  lastTimelineData = data;
  const empty = $("timelineEmpty");
  const wrap = $("timelineWrap");
  const buckets = data.buckets || [];
  const milestones = data.milestones || [];

  if (!buckets.length) {
    if (empty) empty.textContent = t("timeline_empty");
    return;
  }
  empty?.classList.add("hidden");
  wrap?.classList.remove("hidden");

  const labels = buckets.map(b => b.date);
  const counts = buckets.map(b => b.count);
  const engs = buckets.map(b => b.engagement);

  // Build vertical-line annotations for each milestone (only if the date is in the bucket range)
  const annotations = {};
  const labelByDate = {};
  milestones.forEach((m, i) => {
    if (!labels.includes(m.date)) return;
    labelByDate[m.date] = m;
    annotations[`m${i}`] = {
      type: "line",
      xMin: m.date,
      xMax: m.date,
      borderColor: "#06F5B7",
      borderWidth: 1.5,
      borderDash: [5, 4],
      label: {
        display: true,
        content: m.title,
        position: "start",
        backgroundColor: "rgba(6,245,183,0.18)",
        color: "#06F5B7",
        font: { family: "JetBrains Mono", size: 10, weight: "600" },
        padding: { x: 6, y: 3 },
        yAdjust: -2,
      },
    };
  });

  const ctx = $("timelineChart").getContext("2d");
  if (timelineChart) timelineChart.destroy();
  timelineChart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: t("timeline_y_count"),
          data: counts,
          borderColor: "#06F5B7",
          backgroundColor: "rgba(6,245,183,0.18)",
          borderWidth: 2,
          tension: 0.35,
          fill: true,
          yAxisID: "yCount",
          pointBackgroundColor: "#06F5B7",
          pointRadius: 3,
          pointHoverRadius: 5,
        },
        {
          label: t("timeline_y_engagement"),
          data: engs,
          borderColor: "#8B9AFF",
          backgroundColor: "transparent",
          borderWidth: 1.5,
          borderDash: [4, 3],
          tension: 0.3,
          yAxisID: "yEng",
          pointBackgroundColor: "#8B9AFF",
          pointRadius: 2,
          pointHoverRadius: 4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: {
          position: "bottom",
          labels: { color: "#8a8a8a", font: { family: "JetBrains Mono", size: 11 }, padding: 12 },
        },
        annotation: { annotations },
        tooltip: {
          callbacks: {
            afterTitle: (items) => {
              const date = items?.[0]?.label;
              const m = labelByDate[date];
              return m ? `🚩 ${m.title} — ${m.summary}` : "";
            },
          },
        },
      },
      scales: {
        x: {
          ticks: { color: "#8a8a8a", font: { family: "JetBrains Mono", size: 10 }, maxRotation: 0 },
          grid: { color: "#1a1a1a" },
        },
        yCount: {
          position: "left",
          ticks: { color: "#06F5B7", font: { family: "JetBrains Mono", size: 10 } },
          grid: { color: "#1a1a1a" },
          title: { display: true, text: t("timeline_y_count"), color: "#06F5B7", font: { family: "JetBrains Mono", size: 10 } },
        },
        yEng: {
          position: "right",
          ticks: { color: "#8B9AFF", font: { family: "JetBrains Mono", size: 10 } },
          grid: { display: false },
          title: { display: true, text: t("timeline_y_engagement"), color: "#8B9AFF", font: { family: "JetBrains Mono", size: 10 } },
        },
      },
    },
  });

  // Milestone chip list under the chart for quick scan
  const list = $("milestoneList");
  if (!list) return;
  if (!milestones.length) {
    list.innerHTML = `<span class="muted">${t("milestone_empty")}</span>`;
    return;
  }
  list.innerHTML = `<span class="milestone-list-label mono">🚩 ${t("milestone_label")}:</span>` +
    milestones.map((m, i) => {
      const tip = (m.author ? `@${m.author} · ` : "") + (m.summary || "");
      const hasUrl = !!m.tweet_url;
      return `
        <button class="milestone-chip${hasUrl ? '' : ' no-link'}" data-mi="${i}" title="${escapeHtml(tip)}">
          <span class="milestone-date mono">${escapeHtml(m.date)}</span>
          <span class="milestone-title">${escapeHtml(m.title)}</span>
          ${hasUrl ? '<span class="milestone-arrow mono">↗</span>' : ''}
        </button>
      `;
    }).join("");
  // Wire click handlers — prefer scrolling to the in-dashboard Raw Tweets
  // card if the anchor tweet is in our analyzed pool; fall back to opening
  // the X.com original in a new tab.
  list.querySelectorAll(".milestone-chip").forEach(btn => {
    const idx = +btn.dataset.mi;
    const m = milestones[idx];
    if (!m) return;
    btn.onclick = () => openMilestoneSource(m);
  });
}

function openMilestoneSource(m) {
  // Always jump to the source tweet on x.com — that's the "official" page
  // for the milestone, not the analyzed Raw Tweets section.
  if (m.tweet_url) {
    window.open(m.tweet_url, "_blank", "noopener");
  }
}

// ===== Reply generator =====
//
// Tweets with action=reply_now show a "✨ Draft reply" button. Click → POST
// /api/social-listening/generate-reply, then surface the resulting Markdown draft inside the
// follow-up chat panel (same place the user expects AI answers to appear).

async function requestReply(tweetIdx, btn) {
  if (!currentTaskId) { alert(t("err_run_first")); return; }
  const tweet = allTweets[tweetIdx];
  if (!tweet) return;

  const originalLabel = btn.textContent;
  btn.disabled = true;
  btn.textContent = t("btn_gen_reply_loading");

  // Surface the request in the chat as a synthetic user message — gives the
  // user a clear paper trail of "I asked for a reply for X"
  const handle = tweet.author_username || "?";
  const userQ = t("reply_user_question").replace("{handle}", handle);
  appendChat("user", `${userQ}\n\n> ${(tweet.text || "").slice(0, 220)}`);
  scrollToChat();
  const thinkingId = appendChat("assistant", t("chat_thinking"));

  try {
    const resp = await fetch(`${API_BASE}/api/social-listening/generate-reply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ task_id: currentTaskId, tweet_index: tweetIdx, lang: currentLang }),
    });
    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      throw new Error(err.detail || `HTTP ${resp.status}`);
    }
    const data = await resp.json();
    replaceChat(thinkingId, "assistant", data.draft || t("chat_empty_reply"));
    chatHistory.push({ role: "user", content: userQ + "\n\n> " + (tweet.text || "").slice(0, 220) });
    chatHistory.push({ role: "assistant", content: data.draft });
  } catch (err) {
    replaceChat(thinkingId, "assistant", t("err_unknown") + err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = originalLabel;
  }
}

// ===== Alerts (Web ↔ Telegram bot integration) =====
//
// Flow:
//   1. User clicks "Connect Telegram" → POST /api/social-listening/alerts/link/start → backend
//      returns {token, deep_link}. We open the deep_link in a new tab.
//   2. User clicks Start in Telegram → bot consumes token, binds chat_id.
//   3. We poll /api/social-listening/alerts/link/status. Once linked, store chat_id in localStorage
//      and load the user's alert from /api/social-listening/alerts/me.
//   4. CRUD on alerts hits /api/social-listening/alerts/* — same data as Telegram /track.

const STORAGE_CHAT_ID = "welike_chat_id";
let linkPollTimer = null;
let currentAlert = null;

const getStoredChatId = () => {
  const v = localStorage.getItem(STORAGE_CHAT_ID);
  return v ? parseInt(v, 10) : null;
};
const setStoredChatId = (id) => {
  if (id) localStorage.setItem(STORAGE_CHAT_ID, String(id));
  else localStorage.removeItem(STORAGE_CHAT_ID);
};

// Track once-linked so we can render a louder "you got disconnected" state
const STORAGE_LINKED_BEFORE = "welike_linked_once";

function showAlertState(state) {
  ["alertNotLinked", "alertLinking", "alertLinked", "alertCreateBox", "alertExistingBox"]
    .forEach(id => $(id)?.classList.add("hidden"));
  const notLinked = $("alertNotLinked");
  notLinked?.classList.remove("alert-mode");
  if (state === "not_linked") {
    show("alertNotLinked");
    // If the user has previously linked, the lost-connection state is critical.
    // Switch the card to a louder amber/warning treatment with a pulse.
    if (localStorage.getItem(STORAGE_LINKED_BEFORE)) {
      notLinked?.classList.add("alert-mode");
      const titleEl = notLinked?.querySelector("h3");
      const descEl = notLinked?.querySelector("p");
      const btnEl = $("connectTgBtn");
      if (titleEl) titleEl.textContent = t("disconnect_title");
      if (descEl) descEl.textContent = t("disconnect_desc");
      if (btnEl) btnEl.textContent = t("disconnect_btn");
    } else {
      // Reset the cold-start copy in case we toggled this earlier
      const titleEl = notLinked?.querySelector("h3");
      const descEl = notLinked?.querySelector("p");
      const btnEl = $("connectTgBtn");
      if (titleEl) titleEl.textContent = t("connect_title");
      if (descEl) descEl.textContent = t("connect_desc");
      if (btnEl) btnEl.textContent = t("connect_btn");
    }
  }
  else if (state === "linking") show("alertLinking");
  else if (state === "linked_no_alert") {
    localStorage.setItem(STORAGE_LINKED_BEFORE, "1");
    show("alertLinked"); show("alertCreateBox");
    // Refresh the preview now that the form is visible — listeners are wired
    // at boot, so this just paints the initial sample copy in the right column.
    if (typeof updateAlertPreview === "function") updateAlertPreview();
    if (typeof updateCreateBtnState === "function") updateCreateBtnState();
    // If the user just clicked "一键创建 Alert" on the dashboard, drop the
    // analysis-derived data into the form here.
    if (typeof maybeApplyPendingCtaPrefill === "function") maybeApplyPendingCtaPrefill();
  }
  else if (state === "linked_with_alert") {
    localStorage.setItem(STORAGE_LINKED_BEFORE, "1");
    show("alertLinked"); show("alertExistingBox");
  }
}

async function loadAlerts() {
  const chatId = getStoredChatId();
  if (!chatId) {
    showAlertState("not_linked");
    return;
  }
  try {
    const resp = await fetch(`${API_BASE}/api/social-listening/alerts/me?chat_id=${chatId}`);
    if (!resp.ok) {
      // chat_id is stale (user deleted bot, or DB reset) — re-link
      setStoredChatId(null);
      currentAlert = null;
      showAlertState("not_linked");
      return;
    }
    const data = await resp.json();
    $("linkUsername").textContent = data.username ? `@${data.username}` : `chat#${data.chat_id}`;
    if (!data.alerts.length) {
      currentAlert = null;
      showAlertState("linked_no_alert");
    } else {
      currentAlert = data.alerts[0];
      showAlertState("linked_with_alert");
      renderCurrentAlert(currentAlert);
    }
  } catch (err) {
    showAlertState("not_linked");
  }
}

async function startTelegramLink() {
  const btn = $("connectTgBtn");
  if (btn) btn.disabled = true;
  try {
    // Detect browser tz so push timestamps render in the user's local time
    let tz = null;
    try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || null; } catch (_) {}
    const resp = await fetch(`${API_BASE}/api/social-listening/alerts/link/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tz }),
    });
    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      throw new Error(err.detail || `HTTP ${resp.status}`);
    }
    const data = await resp.json();
    if (!data.deep_link) throw new Error(t("connect_no_bot"));
    window.open(data.deep_link, "_blank");
    $("linkingDeepLink").href = data.deep_link;
    showAlertState("linking");
    pollLinkStatus(data.token);
  } catch (err) {
    alert(t("connect_failed") + err.message);
  } finally {
    if (btn) btn.disabled = false;
  }
}

function pollLinkStatus(token) {
  if (linkPollTimer) clearInterval(linkPollTimer);
  let attempts = 0;
  linkPollTimer = setInterval(async () => {
    attempts++;
    if (attempts > 150) { // ~5 minutes
      clearInterval(linkPollTimer);
      linkPollTimer = null;
      alert(t("linking_timeout"));
      cancelLinking();
      return;
    }
    try {
      const resp = await fetch(`${API_BASE}/api/social-listening/alerts/link/status?token=${token}`);
      if (!resp.ok) return;
      const data = await resp.json();
      if (data.linked && data.chat_id) {
        clearInterval(linkPollTimer);
        linkPollTimer = null;
        setStoredChatId(data.chat_id);
        loadAlerts();
      } else if (data.expired) {
        clearInterval(linkPollTimer);
        linkPollTimer = null;
        alert(t("linking_expired"));
        cancelLinking();
      }
    } catch (err) { /* ignore network blips */ }
  }, 2000);
}

function cancelLinking() {
  if (linkPollTimer) { clearInterval(linkPollTimer); linkPollTimer = null; }
  loadAlerts(); // re-evaluate based on stored chat_id
}

function disconnectTelegram() {
  if (!confirm(t("link_disconnect_confirm"))) return;
  setStoredChatId(null);
  currentAlert = null;
  loadAlerts();
}

// Read multi-select sentiment checkboxes and encode for the backend:
// - all 3 selected → "all"
// - subset (1-2)   → comma-joined ("negative" or "negative,neutral")
// - none           → "negative" (most useful default for an alert)
function readSentimentFilter() {
  const checked = Array.from(
    document.querySelectorAll('input[name="sentiment_filter"]:checked')
  ).map(i => i.value);
  if (!checked.length) return "negative";
  if (checked.length === 3) return "all";
  // Canonical order so the persisted value is stable regardless of click order
  const order = ["negative", "positive", "neutral"];
  return order.filter(s => checked.includes(s)).join(",");
}

// Same shape as readSentimentFilter, applied to urgency. Default = "high"
// (the most actionable filter for an alert when the user clears all boxes).
function readUrgencyFilter() {
  const checked = Array.from(
    document.querySelectorAll('input[name="urgency_filter"]:checked')
  ).map(i => i.value);
  if (!checked.length) return "high";
  if (checked.length === 3) return "all";
  const order = ["high", "medium", "low"];
  return order.filter(u => checked.includes(u)).join(",");
}

const MAX_KEYWORDS = 3;
const MAX_HANDLES = 1;

async function createWebAlert() {
  const chatId = getStoredChatId();
  if (!chatId) return;
  // Pull from the chip store; commits any pending typed token before reading
  commitTagFromInput("alertHandles");
  commitTagFromInput("alertKeywords");
  const handles = getTags("alertHandles");
  const keywords = getTags("alertKeywords");
  if (!handles.length && !keywords.length) {
    alert(t("alerts_inputs_required"));
    return;
  }
  if (handles.length > MAX_HANDLES) {
    alert(t("alerts_handles_too_many").replace("{n}", MAX_HANDLES));
    return;
  }
  if (keywords.length > MAX_KEYWORDS) {
    alert(t("alerts_keywords_too_many").replace("{n}", MAX_KEYWORDS));
    return;
  }
  const sentiment_filter = readSentimentFilter();
  const urgency_filter = readUrgencyFilter();
  const digest_mode = !!$("alertDigestMode")?.checked;
  try {
    const resp = await fetch(`${API_BASE}/api/social-listening/alerts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, handles, keywords, sentiment_filter, urgency_filter, digest_mode }),
    });
    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      throw new Error(err.detail || `HTTP ${resp.status}`);
    }
    clearTags("alertHandles");
    clearTags("alertKeywords");
    if ($("alertDigestMode")) $("alertDigestMode").checked = false;
    updateCreateBtnState();
    loadAlerts();
  } catch (err) {
    alert(t("alerts_create_failed") + err.message);
  }
}

// Render a stored canonical filter value (e.g. "negative,neutral") as a
// human-readable label. "all" prints as "All"; subsets print joined with " + ".
function fmtFilterLabel(canonical, kind) {
  if (!canonical || canonical === "all") return t("filter_all");
  const tags = kind === "sentiment"
    ? { positive: "🟢 " + t("sent_positive"), negative: "🔴 " + t("sent_negative"), neutral: "⚪ " + t("sent_neutral") }
    : { high: "🚨 " + t("urg_high_short"), medium: "⚠️ " + t("urg_medium_short"), low: "🔵 " + t("urg_low_short") };
  return canonical.split(",").map(p => tags[p] || p).join(" + ");
}

// Expand a canonical filter to the set of selected leaf values for UI checkboxes.
function expandFilter(canonical, allValues) {
  if (!canonical || canonical === "all") return new Set(allValues);
  return new Set(canonical.split(",").filter(Boolean));
}

// ---- Alert detail card (v3) ---------------------------------------------
// Asymmetric 2-col layout:
//   • Top row    — status hero (active+connected merged), Pause + Delete icons top-right
//   • Left col   — Watching + Filters (the things users tweak)
//   • Right col  — Schedule, Digest (with diagram), Sample Push Preview (live)
//   • Bottom row — primary Run-now CTA
// Hides nothing; just regroups. Filter changes re-render the right-side preview.
function renderCurrentAlert(a) {
  const box = $("alertCard");
  const isActive = !!a.active;
  const lastRun = a.last_run_at ? a.last_run_at.slice(0, 19).replace("T", " ") : t("alerts_meta_never");

  const sentSel = expandFilter(a.sentiment_filter, ["negative", "positive", "neutral"]);
  const urgSel  = expandFilter(a.urgency_filter,   ["high", "medium", "low"]);

  const handleChips = (a.handles || []).map(h =>
    `<span class="watch-chip handle">@${escapeHtml(h)}</span>`
  ).join("");
  const kwChips = (a.keywords || []).map(k =>
    `<span class="watch-chip kw">${escapeHtml(k)}</span>`
  ).join("");
  const watchChips = (handleChips + kwChips) || `<span class="muted">${escapeHtml(t("alerts_meta_telegram_none") || "(none)")}</span>`;

  const sentChip = (val, emoji, label, modCls) => `
    <label class="filter-chip ${modCls} ${sentSel.has(val) ? 'on' : 'off'}">
      <input type="checkbox" name="alert_sent" value="${val}" ${sentSel.has(val) ? 'checked' : ''}
             onchange="updateAlertSentiment()" />
      <span class="filter-chip-dot" aria-hidden="true"></span>
      <span>${emoji} ${label}</span>
    </label>`;
  const urgChip = (val, emoji, label, modCls) => `
    <label class="filter-chip ${modCls} ${urgSel.has(val) ? 'on' : 'off'}">
      <input type="checkbox" name="alert_urg" value="${val}" ${urgSel.has(val) ? 'checked' : ''}
             onchange="updateAlertUrgency()" />
      <span class="filter-chip-dot" aria-hidden="true"></span>
      <span>${emoji} ${label}</span>
    </label>`;

  // Telegram username for the connected-status line in the hero
  const tgUser = $("linkUsername")?.textContent || "";

  // Digest "many → one" diagram (inline SVG, single-color, scales with currentColor)
  const digestDiagram = `
    <svg class="digest-diagram" viewBox="0 0 88 36" width="88" height="36" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <rect x="2"  y="3"  width="22" height="9"  rx="3"/>
      <rect x="2"  y="14" width="22" height="9"  rx="3"/>
      <rect x="2"  y="25" width="22" height="9"  rx="3"/>
      <path d="M30 18 H56"/><path d="M50 13 L56 18 L50 23"/>
      <rect x="60" y="9"  width="26" height="18" rx="4"/>
      <path d="M66 15 H80 M66 19 H78 M66 23 H74"/>
    </svg>`;

  box.innerHTML = `
    <!-- ===== Status hero — combines Active state + Telegram link + global actions ===== -->
    <div class="alert-hero ${isActive ? 'active' : 'paused'}">
      <div class="alert-hero-pulse" aria-hidden="true">
        <span class="alert-hero-dot"></span>
        ${isActive ? '<span class="alert-hero-ring"></span>' : ''}
      </div>
      <div class="alert-hero-text">
        <div class="alert-hero-title">
          ${isActive ? t("alerts_banner_active_title") : t("alerts_banner_paused_title")}
        </div>
        <div class="alert-hero-sub">
          <span class="hero-sub-link mono">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style="vertical-align:-1px;margin-right:4px;"><path d="M21.5 4.5L2.7 11.7c-1.3.5-1.3 1.4 0 1.8l4.7 1.5L18.4 7c.4-.3.8-.1.5.2L9.6 16l-.4 4.7c.5 0 .7-.2.9-.5l2.2-2.1 4.5 3.3c.8.5 1.4.2 1.6-.8L22.7 5.7c.3-1.2-.4-1.7-1.2-1.2z"/></svg>
            ${escapeHtml(tgUser || "@telegram")}
          </span>
          <span class="hero-sub-sep">·</span>
          <span class="mono muted-2">${
            isActive
              ? t("alerts_banner_active_sub").replace("{interval}", a.interval_min)
              : t("alerts_banner_paused_sub")
          }</span>
        </div>
      </div>
      <div class="alert-hero-actions">
        <button class="alert-icon-btn ${isActive ? '' : 'is-paused'}" onclick="toggleAlertActive()" title="${escapeHtml(isActive ? t('alerts_pause') : t('alerts_resume'))}">
          ${isActive ? '⏸' : '▶'} <span class="alert-icon-btn-text">${isActive ? t('alerts_pause') : t('alerts_resume')}</span>
        </button>
        <button class="alert-icon-btn alert-icon-btn-danger" onclick="confirmAndDelete()" title="${escapeHtml(t('alerts_delete'))}" aria-label="${escapeHtml(t('alerts_delete'))}">
          🗑
        </button>
      </div>
    </div>

    <!-- ===== Asymmetric 2-col body ===== -->
    <div class="alert-body-grid">

      <!-- ===== Left col: configuration the user actively tweaks ===== -->
      <div class="alert-col-left">
        <div class="alert-surface">
          <div class="alert-block-label mono">${t("alerts_block_watching")}</div>
          <div class="watch-chips">${watchChips}</div>
        </div>

        <div class="alert-surface">
          <div class="alert-block-label mono">${t("alerts_block_filters")}</div>
          <div class="filter-rows">
            <div class="filter-row">
              <span class="filter-row-label mono">${t("alerts_label_filter")}</span>
              <div class="filter-chip-group" role="group">
                ${sentChip('negative', '🔴', t('sent_negative'), 'tone-neg')}
                ${sentChip('positive', '🟢', t('sent_positive'), 'tone-pos')}
                ${sentChip('neutral',  '⚪', t('sent_neutral'),  'tone-neu')}
              </div>
            </div>
            <div class="filter-row">
              <span class="filter-row-label mono">${t("alerts_label_urgency")}</span>
              <div class="filter-chip-group" role="group">
                ${urgChip('high',   '🚨', t('urg_high_short'),   'tone-neg')}
                ${urgChip('medium', '⚠️', t('urg_medium_short'), 'tone-warn')}
                ${urgChip('low',    '🔵', t('urg_low_short'),    'tone-neu')}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== Right col: schedule + digest + live preview ===== -->
      <div class="alert-col-right">
        <div class="alert-surface alert-surface-compact">
          <div class="alert-block-label mono">${t("alerts_block_schedule")}</div>
          <div class="schedule-row">
            <span class="schedule-meta">
              <span class="schedule-meta-key mono">${t("alerts_meta_interval")}</span>
              <span class="schedule-meta-val">${a.interval_min} min</span>
            </span>
            <span class="schedule-meta">
              <span class="schedule-meta-key mono">${t("alerts_meta_last_run")}</span>
              <span class="schedule-meta-val muted-strong">${escapeHtml(lastRun)}</span>
            </span>
          </div>
        </div>

        <div class="alert-surface alert-surface-compact alert-block-digest">
          <div class="digest-row">
            <div class="digest-meta">
              <div class="alert-block-label mono">${t("alerts_block_digest")}</div>
              <label class="toggle-switch">
                <input type="checkbox" id="alertDigestSwitch" ${a.digest_mode ? 'checked' : ''} onchange="toggleDigestMode()" />
                <span class="track" aria-hidden="true"></span>
                <span class="label-text">${a.digest_mode
                  ? t("alerts_digest_on_explainer")
                  : t("alerts_digest_off_explainer")}</span>
              </label>
            </div>
            <div class="digest-illustration ${a.digest_mode ? 'on' : 'off'}">
              ${digestDiagram}
            </div>
          </div>
        </div>

        <!-- Live sample push preview — re-renders whenever filters change -->
        <div class="alert-surface alert-surface-compact alert-preview-block">
          <div class="alert-block-label mono">${t("alerts_block_preview")}</div>
          <div id="alertPushPreview" class="alert-push-preview"></div>
        </div>
      </div>
    </div>

    <!-- ===== Footer action: primary Run-now ===== -->
    <div class="alert-footer-action">
      <button class="pill-btn primary alert-run-btn" onclick="runAlertNow(this)" title="${escapeHtml(t('alerts_run_now_tip'))}">
        <span class="run-btn-label">${t("alerts_run_now")}</span>
      </button>
    </div>
  `;

  // Initial render of the live preview
  renderAlertPushPreview(a);
}

// Two-step delete: regardless of confirm() being supported, this asks first.
function confirmAndDelete() {
  if (confirm(t("alerts_confirm_delete"))) deleteWebAlert();
}

// Live "what your push will look like" preview, mirrors telegram_bot.format_alert_message.
function renderAlertPushPreview(a) {
  const box = $("alertPushPreview");
  if (!box || !a) return;
  const isZh = currentLang === "zh";

  const sentSel = expandFilter(a.sentiment_filter, ["negative", "positive", "neutral"]);
  const urgSel  = expandFilter(a.urgency_filter,   ["high", "medium", "low"]);
  // Pick the leading sentiment / urgency for the sample bubble (canonical priority)
  const primarySent = sentSel.has("negative") ? "negative"
                    : sentSel.has("positive") ? "positive"
                    : sentSel.has("neutral")  ? "neutral"
                    : null;
  const primaryUrg  = urgSel.has("high")   ? "high"
                    : urgSel.has("medium") ? "medium"
                    : urgSel.has("low")    ? "low"
                    : null;

  const sentMap = {
    negative: ["neg", "🔴", isZh ? "消极" : "negative"],
    positive: ["pos", "🟢", isZh ? "积极" : "positive"],
    neutral:  ["neu", "⚪", isZh ? "中性" : "neutral"],
  };
  const urgMap = {
    high:   ["high", "🚨", isZh ? "高" : "high"],
    medium: ["med",  "⚠️", isZh ? "中" : "medium"],
    low:    ["low",  "🔵", isZh ? "低" : "low"],
  };
  const trio = [];
  if (primarySent) {
    const [c, e, l] = sentMap[primarySent];
    trio.push(`<span class="tg-tag ${c}">${e} ${l}</span>`);
  }
  if (primaryUrg) {
    const [c, e, l] = urgMap[primaryUrg];
    trio.push(`<span class="tg-tag ${c}">${e} ${l}</span>`);
  }

  const projectLabel = [
    ...(a.handles || []).map(h => "@" + h),
    ...(a.keywords || []),
  ].join(" ") || "@your_handle";

  const sample = buildPreviewSentence(a.handles || [], a.keywords || [], currentLang);
  const d = new Date();
  const clock = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;

  box.innerHTML = `
    <div class="cta-tg-stack" style="min-height:0;padding:10px 0 0;">
      <div class="cta-tg-msg">
        <div class="cta-tg-title">🔔 <span class="cta-tg-project">${escapeHtml(projectLabel)}</span> <span class="cta-tg-suffix">${isZh ? "· 新提及" : "· New mention"}</span></div>
        <div class="cta-tg-trio">${trio.join("")}</div>
        <div class="cta-tg-meta">🕐 ${isZh ? "刚刚" : "just now"}</div>
        <div class="cta-tg-meta">👤 Sample User <span class="cta-tg-mute">(@sample_user) · 12.4K</span></div>
        <div class="cta-tg-body">${sample.html}</div>
        <div class="cta-tg-time mono">${clock}</div>
      </div>
    </div>
  `;
}

async function patchAlert(fields) {
  const chatId = getStoredChatId();
  if (!chatId || !currentAlert) return;
  try {
    const resp = await fetch(`${API_BASE}/api/social-listening/alerts/${currentAlert.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, ...fields }),
    });
    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      throw new Error(err.detail || `HTTP ${resp.status}`);
    }
    loadAlerts();
  } catch (err) {
    alert("Update failed: " + err.message);
  }
}

// Multi-select edit handlers — read every checked box and PATCH the CSV.
// The backend's normalize_multi_filter folds "all 3 selected" → "all".
// Empty set falls back to a sensible default so we never send "" to the API.
function _readChecked(name, fallback) {
  const vals = [...document.querySelectorAll(`input[name="${name}"]:checked`)].map(i => i.value);
  if (!vals.length) return fallback;
  return vals.join(",");
}
const updateAlertSentiment = () => patchAlert({ sentiment_filter: _readChecked("alert_sent", "negative") });
const updateAlertUrgency   = () => patchAlert({ urgency_filter:   _readChecked("alert_urg",  "high")     });
const toggleDigestMode = () => currentAlert && patchAlert({ digest_mode: !currentAlert.digest_mode });
const toggleAlertActive = () => currentAlert && patchAlert({ active: !currentAlert.active });

async function runAlertNow(btn) {
  const chatId = getStoredChatId();
  if (!chatId || !currentAlert) return;
  // Visible loading state: spinner + "Running…" copy + disabled
  const labelEl = btn.querySelector(".run-btn-label");
  const originalLabel = labelEl ? labelEl.textContent : btn.textContent;
  btn.disabled = true;
  btn.classList.add("is-loading");
  if (labelEl) {
    labelEl.innerHTML = `<span class="run-spinner" aria-hidden="true"></span>${t("alerts_running")}`;
  } else {
    btn.textContent = t("alerts_running");
  }
  try {
    const resp = await fetch(`${API_BASE}/api/social-listening/alerts/${currentAlert.id}/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId }),
    });
    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      throw new Error(err.error || err.detail || `HTTP ${resp.status}`);
    }
    loadAlerts();
  } catch (err) {
    alert("Run failed: " + err.message);
    btn.disabled = false;
    btn.classList.remove("is-loading");
    if (labelEl) labelEl.textContent = originalLabel;
    else btn.textContent = originalLabel;
  }
}

async function deleteWebAlert() {
  if (!confirm(t("alerts_confirm_delete"))) return;
  const chatId = getStoredChatId();
  if (!chatId || !currentAlert) return;
  await fetch(`${API_BASE}/api/social-listening/alerts/${currentAlert.id}?chat_id=${chatId}`, {
    method: "DELETE",
  });
  loadAlerts();
}

// ===== Live preview of a sample matched tweet =====
// Listens to changes in the alert form and re-renders the right-side card so the
// user can immediately see what their alert will catch.

function _hlEscape(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildPreviewSentence(handles, keywords, lang) {
  // Pick one handle and one keyword as the focal point of the sample
  const handle = handles[0] || (lang === "zh" ? "your_handle" : "your_handle");
  const kw = keywords[0] || (lang === "zh" ? "新功能" : "new feature");
  const allTerms = [...handles.map(h => "@" + h), ...keywords];

  // Use a different template depending on what's filled — picks one with the
  // best emotional valence so the preview reads natural
  let raw;
  if (handles.length && keywords.length) {
    raw = lang === "zh"
      ? `刚试了 @${handle} 的 ${kw}，体验有点劝退…到底什么时候能修一下？`
      : `Just tried @${handle}'s ${kw} — kinda put me off. When is this getting fixed?`;
  } else if (handles.length) {
    raw = lang === "zh"
      ? `@${handle} 真的是越用越离谱，求别再这样了…`
      : `@${handle} keeps getting weirder. Please stop doing this…`;
  } else if (keywords.length) {
    raw = lang === "zh"
      ? `感觉 ${kw} 最近没那么好用了，有人有同感吗？`
      : `${kw} hasn't felt as solid lately — anyone else seeing this?`;
  } else {
    raw = lang === "zh"
      ? "在左侧填入 handle 和关键词，预览会立即更新 ✨"
      : "Fill in a handle or keyword on the left — this preview will update live ✨";
  }

  // Highlight every matched term
  let html = escapeHtml(raw);
  allTerms
    .filter(Boolean)
    .sort((a, b) => b.length - a.length) // longest-first to avoid partial overlap
    .forEach(term => {
      const re = new RegExp(_hlEscape(escapeHtml(term)), "gi");
      html = html.replace(re, m => `<span class="hl">${m}</span>`);
    });
  return { html, hasMatch: handles.length > 0 || keywords.length > 0 };
}

// Render the live preview as a Telegram-bot push card. Mirrors what
// telegram_bot.format_alert_message produces server-side so what users see in
// the preview matches what they'll actually receive.
function updateAlertPreview() {
  const noteEl = $("previewEmptyNote");
  const projectEl = $("tgProjectLabel");
  const trioEl = $("tgTrioLine");
  const bodyEl = $("tgMsgBody");
  const summaryEl = $("tgMsgSummary");
  const timeEl = $("tgMsgTime");
  if (!projectEl || !bodyEl) return;

  const handles = getTags("alertHandles");
  const keywords = getTags("alertKeywords");
  const sentChecked = Array.from(
    document.querySelectorAll('input[name="sentiment_filter"]:checked')
  ).map(i => i.value);
  const urgChecked = Array.from(
    document.querySelectorAll('input[name="urgency_filter"]:checked')
  ).map(i => i.value);

  // Project label (top of bubble): @handle keyword keyword
  const labelTokens = [
    ...handles.map(h => "@" + h.replace(/^@/, "")),
    ...keywords,
  ];
  if (labelTokens.length) {
    projectEl.textContent = labelTokens.join("  ");
  } else {
    projectEl.textContent = currentLang === "zh" ? "@your_handle" : "@your_handle";
  }

  // Trio line: sentiment + urgency tags (the "drone strip" of the TG message)
  const sentMap = { positive: ["pos", "🟢", "积极", "positive"],
                    negative: ["neg", "🔴", "消极", "negative"],
                    neutral:  ["neu", "⚪", "中性", "neutral"] };
  const urgMap  = { high:   ["high", "🚨", "高",  "high"],
                    medium: ["med",  "⚠️", "中",  "medium"],
                    low:    ["low",  "🔵", "低",  "low"] };
  const primarySent = sentChecked.includes("negative") ? "negative"
                    : sentChecked.includes("positive") ? "positive"
                    : sentChecked.includes("neutral")  ? "neutral"
                    : null;
  const primaryUrg  = urgChecked.includes("high")   ? "high"
                    : urgChecked.includes("medium") ? "medium"
                    : urgChecked.includes("low")    ? "low"
                    : null;
  const trioParts = [];
  if (primarySent) {
    const [cls, emoji, zh, en] = sentMap[primarySent];
    trioParts.push(`<span class="tg-tag ${cls}">${emoji} ${currentLang === "zh" ? zh : en}</span>`);
  }
  if (primaryUrg) {
    const [cls, emoji, zh, en] = urgMap[primaryUrg];
    trioParts.push(`<span class="tg-tag ${cls}">${emoji} ${currentLang === "zh" ? zh : en}</span>`);
  }
  // 💬 Action sample (mirrors the real push)
  trioParts.push(`<span class="tg-tag">💬 ${currentLang === "zh" ? "立即回复" : "Reply now"}</span>`);
  trioEl.innerHTML = `<span class="tg-trio">${trioParts.join("")}</span>`;

  // Tweet body — reuse the existing template builder, then highlight matched terms
  const { html, hasMatch } = buildPreviewSentence(handles, keywords, currentLang);
  bodyEl.innerHTML = html;
  if (summaryEl) summaryEl.style.display = hasMatch ? "block" : "none";

  // Live wall-clock so the time looks plausible
  if (timeEl) {
    const d = new Date();
    timeEl.textContent = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  }

  // Hide the helper hint once the user has typed something
  if (noteEl) noteEl.style.display = hasMatch ? "none" : "block";
}

// ===== Tag input: chip-ify a plain <input> =====
// Storage model: each tag-input wrapper has a `_tags` array on the wrapper
// element. Every render of chips is driven from that array; the underlying
// <input> only holds the currently-typed-but-not-committed token.

function _tagWrapper(input) { return input.closest(".tag-input"); }

function getTags(inputId) {
  const wrap = $(inputId)?.parentElement;
  if (!wrap) return [];
  const committed = wrap._tags || [];
  const pending = $(inputId).value.trim();
  // Always include the pending token at submit time so a hit-Submit-without-space
  // user doesn't lose their last word
  return pending ? [...committed, pending] : [...committed];
}

function setTags(inputId, tags) {
  const wrap = $(inputId)?.parentElement;
  if (!wrap) return;
  wrap._tags = tags.slice();
  renderTags(inputId);
}

function clearTags(inputId) { setTags(inputId, []); $(inputId).value = ""; }

function renderTags(inputId) {
  const input = $(inputId);
  const wrap = input.parentElement;
  const tags = wrap._tags || [];
  // Wipe existing chips (everything before <input>)
  Array.from(wrap.querySelectorAll(".tag-chip")).forEach(c => c.remove());
  tags.forEach((tag, idx) => {
    const chip = document.createElement("span");
    chip.className = "tag-chip";
    const text = document.createElement("span");
    text.textContent = inputId === "alertHandles" ? "@" + tag.replace(/^@/, "") : tag;
    const x = document.createElement("button");
    x.type = "button";
    x.className = "tag-chip-remove";
    x.setAttribute("aria-label", "remove");
    x.textContent = "×";
    x.onclick = (ev) => {
      ev.stopPropagation();
      wrap._tags.splice(idx, 1);
      renderTags(inputId);
      updateAlertPreview();
      updateCreateBtnState();
    };
    chip.appendChild(text);
    chip.appendChild(x);
    wrap.insertBefore(chip, input);
  });
  // Reflect "full" state on capped tag inputs
  const cap = inputId === "alertKeywords" ? MAX_KEYWORDS
            : inputId === "alertHandles"  ? MAX_HANDLES
            : Infinity;
  if (cap !== Infinity) {
    const isFull = tags.length >= cap;
    wrap.classList.toggle("full", isFull);
    input.disabled = isFull;
    if (isFull) {
      input.placeholder = currentLang === "zh"
        ? "已达上限，删除现有再添加"
        : "Limit reached — remove first";
    } else {
      const phKey = inputId === "alertKeywords" ? "alerts_keywords_ph" : "alerts_handles_ph";
      input.placeholder = I18N[currentLang]?.[phKey] || "";
    }
  }
}

function commitTagFromInput(inputId, opts = {}) {
  const input = $(inputId);
  const wrap = input.parentElement;
  const raw = input.value.trim();
  if (!raw) return;
  // Tokenize on whitespace too — pasting "@a @b" should produce two chips
  const tokens = raw.split(/\s+/).map(s => inputId === "alertHandles" ? s.replace(/^@/, "") : s).filter(Boolean);
  if (!wrap._tags) wrap._tags = [];
  const max = inputId === "alertKeywords" ? MAX_KEYWORDS
            : inputId === "alertHandles"  ? MAX_HANDLES
            : Infinity;
  const labelHintSelector = inputId === "alertKeywords"
    ? ".muted[data-i18n='alerts_keywords_max']"
    : null;
  for (const tok of tokens) {
    if (wrap._tags.includes(tok)) continue;       // dedupe
    if (wrap._tags.length >= max) {
      // Flash the label to communicate the cap
      const lbl = wrap.closest(".form-row")?.querySelector(".muted[data-i18n='alerts_keywords_max']");
      if (lbl) {
        lbl.style.color = "var(--warn)";
        setTimeout(() => { lbl.style.color = ""; }, 1200);
      }
      break;
    }
    wrap._tags.push(tok);
  }
  input.value = "";
  renderTags(inputId);
  updateAlertPreview();
  updateCreateBtnState();
}

function setupTagInput(inputId) {
  const input = $(inputId);
  const wrap = input?.parentElement;
  if (!input || !wrap || wrap._tagsWired) return;
  wrap._tags = wrap._tags || [];
  wrap._tagsWired = true;
  // Click anywhere in the wrapper → focus the actual input
  wrap.addEventListener("click", (e) => {
    if (e.target === wrap) input.focus();
  });
  input.addEventListener("focus", () => wrap.classList.add("focused"));
  input.addEventListener("blur", () => {
    wrap.classList.remove("focused");
    // Commit any pending text on blur
    commitTagFromInput(inputId);
  });
  input.addEventListener("keydown", (e) => {
    if (e.key === " " || e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commitTagFromInput(inputId);
    } else if (e.key === "Backspace" && input.value === "" && (wrap._tags || []).length) {
      // Empty input + Backspace = remove the last chip
      wrap._tags.pop();
      renderTags(inputId);
      updateAlertPreview();
      updateCreateBtnState();
    }
  });
  input.addEventListener("input", () => {
    updateAlertPreview();
    updateCreateBtnState();
  });
  renderTags(inputId);
}

// ===== CTA disabled state =====
// Submit is only meaningful when at least one handle or keyword is set
function updateCreateBtnState() {
  const btn = $("createAlertBtn");
  if (!btn) return;
  const hasInput = getTags("alertHandles").length > 0 || getTags("alertKeywords").length > 0;
  btn.disabled = !hasInput;
}

function setupAlertPreview() {
  setupTagInput("alertHandles");
  setupTagInput("alertKeywords");
  document.querySelectorAll('input[name="sentiment_filter"], input[name="urgency_filter"]').forEach(el => {
    if (!el._previewWired) {
      el.addEventListener("change", updateAlertPreview);
      el._previewWired = true;
    }
  });
  updateAlertPreview();
  updateCreateBtnState();
}

// ===== Boot =====
document.addEventListener("DOMContentLoaded", () => {
  $("queryInput").addEventListener("keydown", e => { if (e.key === "Enter") startAnalysis(); });
  $("chatInput").addEventListener("keydown", e => { if (e.key === "Enter") sendChat(); });

  // Language toggle
  document.querySelectorAll(".lang-btn").forEach(b => {
    b.addEventListener("click", () => setLang(b.dataset.lang));
  });

  // Register chartjs-plugin-annotation if it loaded (script tag may fail offline)
  if (window.Chart && window["chartjs-plugin-annotation"]) {
    Chart.register(window["chartjs-plugin-annotation"]);
  }

  applyI18n();
  setupChatFabAutoHide();
  setupAlertPreview();
  setupAlertAutoSync();
});

// Re-fetch alerts when the user comes back to the tab — covers the case where
// they changed something via Telegram (/sentiment, /digest, etc.) while the
// browser was hidden. No background polling: only fires on focus/visibility,
// debounced to ~1 click/sec to dedupe focus + visibilitychange firing together.
function setupAlertAutoSync() {
  const isOnAlertsView = () => {
    const v = document.getElementById("view-alerts");
    return v && !v.classList.contains("hidden");
  };
  let lastReload = 0;
  const maybeReload = () => {
    if (!isOnAlertsView()) return;
    const now = Date.now();
    if (now - lastReload < 800) return;
    lastReload = now;
    loadAlerts();
  };
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) maybeReload();
  });
  window.addEventListener("focus", maybeReload);
}
