"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLang } from "@/lib/use-lang";
import { Radio, DollarSign, Newspaper, ArrowRight, ChevronRight, Globe, RotateCcw, Activity, Signal, Zap } from "lucide-react";

const TOOLS_EN = [
  {
    id: "social-listening",
    href: "/tools/social-listening",
    icon: Radio,
    name: "Social Listening",
    description:
      "Monitor real-time discussions about your product across X, Reddit, and developer communities. Get alerts on sentiment shifts and trending narratives.",
    features: [
      "Real-time mention tracking",
      "Sentiment analysis & alerts",
      "Competitor mention comparison",
      "Trending narrative extraction",
    ],
    color: "purple",
  },
  {
    id: "kol-pricer",
    href: "/tools/kol-pricer",
    icon: DollarSign,
    name: "KOL Pricer",
    description:
      "Get fair-market pricing benchmarks for KOL and influencer partnerships. Compare rates across platforms and engagement tiers.",
    features: [
      "Platform-specific pricing data",
      "Engagement-based benchmarks",
      "ROI estimation per KOL",
      "Budget allocation suggestions",
    ],
    color: "brand",
  },
  {
    id: "news",
    href: "/tools/news",
    icon: Newspaper,
    name: "AI News",
    description:
      "Daily AI intelligence powered by Kimi web search. Track news, funding rounds, growth insights, and new AI tools — with Telegram push support.",
    features: [
      "Daily news timeline",
      "Funding & growth insights",
      "AI tool picks",
      "Telegram push & scheduler",
    ],
    color: "cyan",
  },
];

const TOOLS_ZH = [
  {
    id: "social-listening",
    href: "/tools/social-listening",
    icon: Radio,
        name: "社交聆听",
    description:
      "在 X、Reddit 和开发者社区中实时监控关于您产品的讨论。获取情绪变化和热门叙事的提醒。",
    features: [
      "实时提及追踪",
      "情绪分析与告警",
      "竞品提及对比",
      "热门叙事提取",
    ],
    color: "purple",
  },
  {
    id: "kol-pricer",
    href: "/tools/kol-pricer",
    icon: DollarSign,
    name: "KOL 定价器",
    description:
      "获取 KOL 和网红合作的公允市场价格基准。跨平台和参与度层级比较费率。",
    features: [
      "平台专属定价数据",
      "基于参与度的基准",
      "每个 KOL 的 ROI 估算",
      "预算分配建议",
    ],
    color: "brand",
  },
  {
    id: "news",
    href: "/tools/news",
    icon: Newspaper,
    name: "AI 新闻",
    description:
      "由 Kimi 网络搜索驱动的每日 AI 情报。追踪新闻、融资轮次、增长洞察和新 AI 工具 — 支持 Telegram 推送。",
    features: [
      "每日新闻时间线",
      "融资与增长洞察",
      "AI 工具推荐",
      "Telegram 推送与定时",
    ],
    color: "cyan",
  },
];

const COLOR_MAP: Record<string, { bg: string; border: string; icon: string; badge: string; hoverBorder: string; hoverBg: string; hoverShadow: string; iconHoverBg: string; iconHoverBorder: string; iconHoverShadow: string; iconGlow: string }> = {
  purple: {
    bg: "bg-purple-500/5",
    border: "border-purple-500/20",
    icon: "bg-purple-500/10 text-purple-400",
    badge: "bg-purple-500/10 text-purple-400",
    hoverBorder: "hover:border-purple-400/55",
    hoverBg: "hover:bg-[#141414]",
    hoverShadow: "hover:shadow-[0_0_0_1px_rgba(168,85,247,0.18),0_0_40px_rgba(168,85,247,0.14),0_18px_50px_rgba(168,85,247,0.10)]",
    iconHoverBg: "group-hover:bg-[#1f1433]",
    iconHoverBorder: "group-hover:border-purple-400/45",
    iconHoverShadow: "group-hover:shadow-[0_0_24px_rgba(168,85,247,0.20)]",
    iconGlow: "group-hover:drop-shadow-[0_0_10px_rgba(168,85,247,0.7)]",
  },
  brand: {
    bg: "bg-brand-500/5",
    border: "border-brand-500/20",
    icon: "bg-brand-500/10 text-brand-500",
    badge: "bg-brand-500/10 text-brand-500",
    hoverBorder: "hover:border-brand-400/55",
    hoverBg: "hover:bg-[#141414]",
    hoverShadow: "hover:shadow-[0_0_0_1px_rgba(6,245,183,0.18),0_0_40px_rgba(6,245,183,0.14),0_18px_50px_rgba(6,245,183,0.10)]",
    iconHoverBg: "group-hover:bg-[#0a3329]",
    iconHoverBorder: "group-hover:border-brand-400/45",
    iconHoverShadow: "group-hover:shadow-[0_0_24px_rgba(6,245,183,0.20)]",
    iconGlow: "group-hover:drop-shadow-[0_0_10px_rgba(6,245,183,0.7)]",
  },
  cyan: {
    bg: "bg-cyan-500/5",
    border: "border-cyan-500/20",
    icon: "bg-cyan-500/10 text-cyan-400",
    badge: "bg-cyan-500/10 text-cyan-400",
    hoverBorder: "hover:border-cyan-400/55",
    hoverBg: "hover:bg-[#141414]",
    hoverShadow: "hover:shadow-[0_0_0_1px_rgba(34,211,238,0.18),0_0_40px_rgba(34,211,238,0.14),0_18px_50px_rgba(34,211,238,0.10)]",
    iconHoverBg: "group-hover:bg-[#0a2a33]",
    iconHoverBorder: "group-hover:border-cyan-400/45",
    iconHoverShadow: "group-hover:shadow-[0_0_24px_rgba(34,211,238,0.20)]",
    iconGlow: "group-hover:drop-shadow-[0_0_10px_rgba(34,211,238,0.7)]",
  },
};

export default function WorkspacePage() {
  const { productContext, deleteProductContext } = useAuth();
  const lang = useLang();
  const router = useRouter();
  const TOOLS = lang === 'zh' ? TOOLS_ZH : TOOLS_EN;
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Show modal when auth finishes loading and user has no product
  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem("welike_dismiss_onboarding") === "true") {
      setShowOnboardingModal(false);
      return;
    }
    setShowOnboardingModal(!productContext);
  }, [productContext]);

  const dismissModal = () => {
    sessionStorage.setItem("welike_dismiss_onboarding", "true");
    setShowOnboardingModal(false);
  };

  // Derive display info from product context
  const categoryLabel = productContext?.category
    ? productContext.category
        .replace(/-/g, " ")
        .replace(/\bai\b/gi, "AI")
        .replace(/\b\w/g, (c) => c.toUpperCase())
    : null;

  return (
    <div>
      {/* Onboarding Modal */}
      {showOnboardingModal && !productContext && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl border border-surface-700 bg-surface-900 p-8 shadow-2xl">
            <button
              type="button"
              onClick={dismissModal}
              className="absolute right-4 top-4 text-surface-500 hover:text-white transition-colors"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="mb-6 inline-flex rounded-xl bg-brand-500/10 p-3 text-brand-500">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">
              {lang === 'zh' ? '欢迎来到 WeLike！' : 'Welcome to WeLike!'}
            </h3>
            <p className="text-sm text-surface-400 leading-relaxed mb-6">
              {lang === 'zh'
                ? '开始使用前，请先添加你的产品信息。这将帮助我们为你提供更精准的 GTM 工具和建议。'
                : 'Before you start, please add your product information. This helps us provide more accurate GTM tools and recommendations for you.'}
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => router.push("/onboarding")}
                className="flex-1 rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-black transition-all active:scale-[0.97] hover:bg-brand-400"
              >
                {lang === 'zh' ? '添加产品' : 'Add Product'}
              </button>
              <button
                type="button"
                onClick={dismissModal}
                className="flex-1 rounded-xl border border-surface-700 px-5 py-2.5 text-sm font-medium text-surface-300 transition-colors hover:border-surface-500 hover:text-white"
              >
                {lang === 'zh' ? '稍后再说' : 'Maybe Later'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* System Status Bar */}
      <div className="flex items-center justify-between rounded-lg border border-surface-800 bg-surface-900/80 px-4 py-2 mb-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-brand-500 shadow-[0_0_6px_rgba(6,245,183,0.5)]" />
            <span className="text-[10px] font-mono text-brand-500 uppercase tracking-wider">SYSTEM</span>
          </div>
          <div className="hidden sm:flex items-center gap-3 text-[10px] font-mono text-surface-500">
            <span className="flex items-center gap-1">
              <Activity className="h-3 w-3 text-surface-600" />
              {lang === 'zh' ? '项目状态' : 'Project status'}
              <span className="text-brand-500 ml-1">{lang === 'zh' ? '活跃' : 'Active'}</span>
            </span>
            <span className="text-surface-700">|</span>
            <span className="flex items-center gap-1">
              <Zap className="h-3 w-3 text-surface-600" />
              {lang === 'zh' ? '模块' : 'Modules'}
              <span className="text-surface-300 ml-1">3 {lang === 'zh' ? '个在线' : 'live'}</span>
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-500 animate-pulse" />
          <span className="text-[10px] font-mono text-surface-600">{lang === 'zh' ? '系统运行中' : 'System online'}</span>
        </div>
      </div>

      {/* Hero — Product Card */}
      <div className="rounded-2xl border border-surface-800 bg-gradient-to-br from-surface-900 via-surface-900 to-brand-500/5 p-8 mb-10 relative overflow-hidden">
        {/* Subtle dot matrix background */}
        <div className="absolute inset-0 bg-dot-matrix opacity-30 pointer-events-none" />
        <div className="relative">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs font-semibold uppercase tracking-widest text-brand-500 mb-3">
                {lang === 'zh' ? 'GTM 工作台' : 'GTM Workspace'}
              </p>
              <h1 className="text-3xl font-bold tracking-tight mb-3">
                {productContext?.name || (lang === 'zh' ? '你的产品' : 'Your Product')}
              </h1>
              {productContext?.oneLiner && (
                <p className="text-surface-300 text-base leading-relaxed mb-5 max-w-xl">
                  {productContext.oneLiner}
                </p>
              )}

              {/* Meta tags */}
              <div className="flex flex-wrap items-center gap-2">
                {categoryLabel && (
                  <span className="inline-flex items-center gap-1.5 bg-brand-500/10 text-brand-500 text-xs font-medium px-3 py-1 rounded-full">
                    {categoryLabel}
                  </span>
                )}
                {productContext?.stage && (
                  <span className="inline-flex items-center gap-1.5 bg-surface-800 text-surface-300 text-xs font-medium px-3 py-1 rounded-full">
                    {productContext.stage.charAt(0).toUpperCase() + productContext.stage.slice(1)}
                  </span>
                )}
                {productContext?.targetRegions && productContext.targetRegions.length > 0 && (
                  <span className="inline-flex items-center gap-1.5 bg-surface-800 text-surface-300 text-xs font-medium px-3 py-1 rounded-full">
                    <Globe className="h-3 w-3" />
                    {productContext.targetRegions.slice(0, 2).join(", ")}
                    {productContext.targetRegions.length > 2 && ` +${productContext.targetRegions.length - 2}`}
                  </span>
                )}
                {productContext?.url && (
                  <a
                    href={productContext.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-surface-500 hover:text-brand-500 transition-colors"
                  >
                    {productContext.url.replace(/^https?:\/\//, "")}
                    <ArrowRight className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {productContext && (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center gap-1.5 text-xs text-surface-500 hover:text-white bg-surface-800 hover:bg-surface-700 px-3 py-2 rounded-lg transition-colors"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  {lang === 'zh' ? '重置' : 'Reset'}
                </button>
              )}
              <Link
                href="/onboarding"
                className="flex items-center gap-1.5 text-xs text-surface-500 hover:text-white bg-surface-800 hover:bg-surface-700 px-3 py-2 rounded-lg transition-colors"
              >
                {lang === 'zh' ? '编辑' : 'Edit'}
                <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-sm rounded-2xl border border-surface-700 bg-surface-900 p-8 shadow-2xl">
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(false)}
              className="absolute right-4 top-4 text-surface-500 hover:text-white transition-colors"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="mb-6 inline-flex rounded-xl bg-surface-800 p-3 text-surface-400">
              <RotateCcw className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">
              {lang === 'zh' ? '重置项目' : 'Reset Project'}
            </h3>
            <p className="text-sm text-surface-400 leading-relaxed mb-6">
              {lang === 'zh'
                ? `确定要重置「${productContext?.name}」吗？这将清除当前项目信息，你可以重新添加。`
                : `Are you sure you want to reset "${productContext?.name}"? This will clear the current project info so you can start fresh.`}
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={async () => {
                  setIsDeleting(true);
                  try {
                    await deleteProductContext();
                    sessionStorage.removeItem("welike_dismiss_onboarding");
                    setShowDeleteConfirm(false);
                    setShowOnboardingModal(true);
                  } finally {
                    setIsDeleting(false);
                  }
                }}
                disabled={isDeleting}
                className="flex-1 rounded-xl bg-surface-800 px-5 py-2.5 text-sm font-semibold text-surface-200 transition-all hover:bg-surface-700 disabled:opacity-50"
              >
                {isDeleting ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="h-4 w-4 border-2 border-surface-400 border-t-transparent rounded-full animate-spin" />
                    {lang === 'zh' ? '重置中...' : 'Resetting...'}
                  </span>
                ) : (
                  lang === 'zh' ? '确认重置' : 'Reset'
                )}
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 rounded-xl border border-surface-700 px-5 py-2.5 text-sm font-medium text-surface-300 transition-colors hover:border-surface-500 hover:text-white"
              >
                {lang === 'zh' ? '取消' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toolkit Section */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-1">
          {lang === 'zh' ? '工具集与策略指南' : 'Toolkit and Playbook'}
        </h2>
        <p className="text-sm text-surface-500">
          {lang === 'zh'
            ? '经过实战检验的工具，助你执行市场进入策略。'
            : 'Battle-tested tools to execute your go-to-market strategy.'}
        </p>
      </div>

      {/* Tool Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-visible">
        {TOOLS.map((tool) => {
          const colors = COLOR_MAP[tool.color];
          const Icon = tool.icon;
          const moduleMeta: Record<string, { status: string; tag: string }> = {
            "social-listening": {
              status: lang === "zh" ? "实时监控" : "Real-time monitoring",
              tag: lang === "zh" ? "X + Reddit" : "X + Reddit",
            },
            "kol-pricer": {
              status: lang === "zh" ? "定价基准" : "Pricing benchmarks",
              tag: lang === "zh" ? "ROI 建模" : "ROI modeling",
            },
            "news": {
              status: lang === "zh" ? "每日更新" : "Daily updates",
              tag: lang === "zh" ? "Telegram 推送" : "Telegram push",
            },
          };
          const meta = moduleMeta[tool.id];
          const glowColor = tool.color === "brand"
            ? "20,240,200"
            : tool.color === "purple"
              ? "168,85,247"
              : "34,211,238";
          return (
            <Link
              key={tool.id}
              href={tool.href}
              className={`group relative cursor-pointer rounded-xl border ${colors.border} ${colors.bg} p-6 transition-all duration-300 ease-out hover:-translate-y-2 hover:scale-[1.015] ${colors.hoverBorder} ${colors.hoverBg}`}
              style={{
                boxShadow: `0 0 0 1px rgba(${glowColor},0)`,
                transition: "all 300ms ease-out",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = `0 0 0 1px rgba(${glowColor},0.28), 0 0 36px rgba(${glowColor},0.22), 0 24px 80px rgba(${glowColor},0.16)`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = `0 0 0 1px rgba(${glowColor},0)`;
              }}
            >
              {/* Radial highlight inside card */}
              <div
                className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                  background: `radial-gradient(circle at 65% 20%, rgba(${glowColor},0.18), transparent 38%)`,
                }}
              />
              {/* Top gradient highlight */}
              <div
                className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                  background: `linear-gradient(180deg, rgba(${glowColor},0.06), transparent 35%)`,
                }}
              />
              <div className="relative">
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`h-12 w-12 rounded-xl border border-white/5 ${colors.icon} flex items-center justify-center transition-all duration-300 ${colors.iconHoverBg} ${colors.iconHoverBorder}`}
                    style={{
                      boxShadow: `0 0 0px rgba(${glowColor},0)`,
                      transition: "all 300ms ease-out",
                    }}
                    onMouseEnter={(e) => {
                      // Parent hover handles this via group, but we also set inline for the icon container
                    }}
                  >
                    <Icon
                      className={`h-6 w-6 transition-all duration-300 ${colors.iconGlow}`}
                    />
                  </div>
                  <ArrowRight className="h-5 w-5 text-surface-600 transition-all duration-300 group-hover:text-surface-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
                </div>

                <h3 className="text-lg font-semibold mb-2 transition-colors duration-300 group-hover:text-white">
                  {tool.name}
                </h3>
                <p className="text-sm text-surface-400 leading-relaxed mb-4">
                  {tool.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {tool.features.map((feature) => (
                    <span
                      key={feature}
                      className={`text-xs ${colors.badge} px-2 py-1 rounded-md`}
                    >
                      {feature}
                    </span>
                  ))}
                </div>

                {/* Module metadata */}
                {meta && (
                  <div className="flex items-center gap-3 pt-3 border-t border-surface-800/50">
                    <span className="flex items-center gap-1.5 text-[10px] font-mono text-surface-500">
                      <span className={`h-1.5 w-1.5 rounded-full ${tool.color === "brand" ? "bg-brand-500" : tool.color === "purple" ? "bg-purple-400" : "bg-cyan-400"}`} />
                      {meta.status}
                    </span>
                    <span className="text-surface-700">·</span>
                    <span className="text-[10px] font-mono text-surface-500">{meta.tag}</span>
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Coming Soon */}
      <div className="mt-8 text-center">
        <p className="text-xs text-surface-600">
          {lang === 'zh'
            ? '更多工具即将推出 — Scout、AEO Optimizer、Channel Matcher 等。'
            : 'More tools coming soon — Scout, AEO Optimizer, Channel Matcher, and more.'}
        </p>
      </div>
    </div>
  );
}
