"use client";
import { useRef, useEffect } from "react";
import Link from "next/link";
import { useLang } from "@/lib/use-lang";
import { DollarSign } from "lucide-react";

// ===== Staggered entrance animation hook (page load) — bolder =====
function useStaggeredEntrance(staggerDelay = 0.08) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const children = el.querySelectorAll("[data-stagger]");
    children.forEach((child, i) => {
      const htmlChild = child as HTMLElement;
      htmlChild.style.opacity = "0";
      htmlChild.style.transform = "translateY(40px) scale(0.95)";
      htmlChild.style.transition = "opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1), transform 0.7s cubic-bezier(0.22, 1, 0.36, 1)";
      htmlChild.style.transitionDelay = `${i * staggerDelay}s`;
      requestAnimationFrame(() => {
        htmlChild.style.opacity = "1";
        htmlChild.style.transform = "translateY(0) scale(1)";
      });
    });
  }, [staggerDelay]);
  return ref;
}


// ===== Scroll-triggered staggered entrance hook — bolder =====
function useScrollReveal(staggerDelay = 0.08) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const children = el.querySelectorAll("[data-reveal]");
    if (!children.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const revealed = entry.target.closest("[data-reveal-group]")?.querySelectorAll("[data-reveal]") || [entry.target];
            revealed.forEach((child, i) => {
              const htmlChild = child as HTMLElement;
              htmlChild.style.opacity = "0";
              htmlChild.style.transform = "translateY(40px) scale(0.93)";
              htmlChild.style.transition = "opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1), transform 0.7s cubic-bezier(0.22, 1, 0.36, 1)";
              htmlChild.style.transitionDelay = `${i * staggerDelay}s`;
              requestAnimationFrame(() => {
                htmlChild.style.opacity = "1";
                htmlChild.style.transform = "translateY(0) scale(1)";
              });
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08 }
    );
    children.forEach((child) => observer.observe(child));
    return () => observer.disconnect();
  }, [staggerDelay]);
  return ref;
}


const FEATURES_EN = [
  {
    title: "Real-Time X Data",
    description: "Pulls follower counts, recent tweets, impressions, and engagement directly from X API v2.",
    icon: <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>,
  },
  {
    title: "4-Dimension Scoring",
    description: "Evaluates Influence Depth, Follower Quality, Content Stability, and Engagement Quality.",
    icon: <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>,
  },
  {
    title: "AI Domain Detection",
    description: "Claude AI classifies the KOL's niche (crypto, AI, finance, etc.) for accurate domain-specific pricing.",
    icon: <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
    </svg>,
  },
  {
    title: "Transparent Formula",
    description: "Every calculation is visible — CPM, domain multiplier, impressions — no black boxes.",
    icon: <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25V13.5zm0 2.25h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25V18zm2.498-6.75h.007v.008h-.007v-.008zm0 2.25h.007v.008h-.007V13.5zm0 2.25h.007v.008h-.007v-.008zm0 2.25h.007v.008h-.007V18zm2.504-6.75h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V13.5zm0 2.25h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V18zm2.498-6.75h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V13.5zM8.25 6h7.5v2.25h-7.5V6zM12 2.25c-1.892 0-3.758.11-5.593.322C5.307 2.7 4.5 3.65 4.5 4.757V19.5a2.25 2.25 0 002.25 2.25h10.5a2.25 2.25 0 002.25-2.25V4.757c0-1.108-.806-2.057-1.907-2.185A48.507 48.507 0 0012 2.25z" />
    </svg>,
  },
  {
    title: "Real-Time Progress",
    description: "Watch the analysis happen step by step with live SSE streaming logs.",
    icon: <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" />
    </svg>,
  },
  {
    title: "Price Range",
    description: "Get a recommended price with min/max range for negotiation flexibility.",
    icon: <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>,
  },
];

const FEATURES_ZH = [
  {
    title: "实时 X 数据",
    description: "直接从 X API v2 获取粉丝数、近期推文、展示量和互动数据。",
    icon: <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>,
  },
  {
    title: "四维评分",
    description: "评估影响力深度、粉丝质量、内容稳定性和互动质量。",
    icon: <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>,
  },
  {
    title: "AI 领域检测",
    description: "Claude AI 自动识别 KOL 的垂直领域（加密、AI、金融等），实现精准的领域定价。",
    icon: <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
    </svg>,
  },
  {
    title: "透明公式",
    description: "每项计算都清晰可见 — CPM、领域乘数、展示量 — 没有黑箱。",
    icon: <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25V13.5zm0 2.25h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25V18zm2.498-6.75h.007v.008h-.007v-.008zm0 2.25h.007v.008h-.007V13.5zm0 2.25h.007v.008h-.007v-.008zm0 2.25h.007v.008h-.007V18zm2.504-6.75h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V13.5zm0 2.25h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V18zm2.498-6.75h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V13.5zM8.25 6h7.5v2.25h-7.5V6zM12 2.25c-1.892 0-3.758.11-5.593.322C5.307 2.7 4.5 3.65 4.5 4.757V19.5a2.25 2.25 0 002.25 2.25h10.5a2.25 2.25 0 002.25-2.25V4.757c0-1.108-.806-2.057-1.907-2.185A48.507 48.507 0 0012 2.25z" />
    </svg>,
  },
  {
    title: "实时进度",
    description: "通过实时 SSE 流式日志，逐步观察分析过程。",
    icon: <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" />
    </svg>,
  },
  {
    title: "价格区间",
    description: "获取推荐价格及最低/最高区间，为谈判提供灵活性。",
    icon: <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>,
  },
];

export default function KolPricerHome() {
  const lang = useLang();
  const features = lang === 'zh' ? FEATURES_ZH : FEATURES_EN;
  const staggerRef = useStaggeredEntrance(0.07);
  const revealRef = useScrollReveal(0.07);

  return (
    <div ref={staggerRef} className="relative">
      {/* ===== Ambient background layers ===== */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        {/* Pixel grid */}
        <div className="pixel-grid" />
        {/* Big ribbon glow — mint */}
        <div
          className="big-ribbon-glow absolute -left-32 -top-20 h-[500px] w-[800px] rounded-full"
          style={{
            background: "radial-gradient(ellipse at 30% 50%, rgba(6,245,183,0.18), transparent 70%)",
            filter: "blur(80px)",
          }}
        />
        {/* Big ribbon band — white */}
        <div
          className="big-ribbon-band absolute -right-40 top-40 h-[400px] w-[700px] rounded-full"
          style={{
            background: "radial-gradient(ellipse at 70% 50%, rgba(255,255,255,0.06), transparent 70%)",
            filter: "blur(60px)",
          }}
        />
        {/* Big ribbon signal — mint accent */}
        <div
          className="big-ribbon-signal absolute left-1/3 -bottom-20 h-[350px] w-[600px] rounded-full"
          style={{
            background: "radial-gradient(ellipse at 50% 50%, rgba(6,245,183,0.10), transparent 70%)",
            filter: "blur(100px)",
          }}
        />
        {/* Drifting particles */}
        <div className="drift-particle-1 absolute left-[15%] top-[20%] h-1.5 w-1.5 rounded-full bg-brand-500/40" />
        <div className="drift-particle-2 absolute right-[20%] top-[30%] h-1 w-1 rounded-full bg-white/30" />
        <div className="drift-particle-3 absolute left-[30%] bottom-[25%] h-2 w-2 rounded-full bg-brand-500/30" />
        <div className="drift-particle-4 absolute right-[35%] bottom-[15%] h-1 w-1 rounded-full bg-white/25" />
        <div className="drift-particle-5 absolute left-[60%] top-[15%] h-1.5 w-1.5 rounded-full bg-brand-500/35" />
        <div className="drift-particle-6 absolute right-[10%] top-[60%] h-1 w-1 rounded-full bg-white/20" />
        {/* Scanning sweep */}
        <div className="scanning-sweep absolute inset-y-0 left-0 w-[60%] bg-gradient-to-r from-transparent via-brand-500/8 to-transparent pointer-events-none" />

      </div>

      {/* ===== Unified Page Hero (vertically balanced) ===== */}
      <div className="max-w-[1100px] mx-auto min-h-[calc(100vh-180px)] flex flex-col justify-center text-center -mt-8 relative z-10">
        {/* 1. Product identity row */}
        <div data-stagger className="flex items-center justify-center gap-2 mb-6">
          <span className="text-sm text-white/90 font-semibold">WeLike</span>
          <span className="text-sm text-white/45">/</span>
          <span className="text-sm text-white/45">{lang === 'zh' ? 'KOL Pricer' : 'KOL Pricer'}</span>
        </div>

        {/* 2. Eyebrow badge */}
        <div data-stagger className="inline-flex items-center gap-2 rounded-full border border-brand-500/25 bg-brand-500/5 px-4 py-1.5 mb-6 mx-auto relative overflow-hidden">
          <div className="badge-scan absolute inset-0 bg-gradient-to-r from-transparent via-brand-500/20 to-transparent pointer-events-none" />
          <DollarSign className="h-3.5 w-3.5 text-brand-500 relative z-10" />
          <span className="text-[14px] font-mono tracking-[0.18em] text-brand-500 uppercase relative z-10">AI-POWERED KOL PRICING</span>
        </div>

        {/* 3. Main title */}
        <h1 data-stagger className="text-[40px] sm:text-[56px] font-semibold leading-[1.02] tracking-[-0.04em] text-white mb-5 font-display">
          {lang === 'zh' ? 'KOL Pricer' : 'KOL Pricer'}
        </h1>

        {/* 4. Benefit line */}
        <h2 data-stagger className="text-[22px] sm:text-[28px] font-semibold leading-[1.2] text-surface-200 mb-6 font-display">
          {lang === 'zh' ? (
            <>了解每条 <span className="text-brand-500">KOL 推文</span>的真实价值</>
          ) : (
            <>Know the True Value of Every <span className="text-brand-500">KOL Tweet</span></>
          )}
        </h2>

        {/* 5. Description */}
        <p data-stagger className="text-[16px] sm:text-[18px] text-white/60 leading-[1.65] max-w-[820px] mx-auto mb-8">
          {lang === 'zh'
            ? '使用实时 X 数据、多维评分和 AI 领域分析，计算公允的赞助推文定价。停止猜测，用数据定价。'
            : 'Calculate fair sponsored tweet pricing using real-time X data, multi-dimensional scoring, and AI domain analysis. Stop guessing, start pricing with data.'}
        </p>

        {/* 6. Action area */}
        <div data-stagger className="flex items-center justify-center gap-4">
          <Link
            href="/tools/kol-pricer/tool"
            className="rounded-xl bg-brand-500 px-8 py-3 text-base font-semibold text-black transition-all duration-300 active:scale-[0.97] hover:bg-brand-400 hover:shadow-lg hover:shadow-brand-500/20 hover:-translate-y-0.5"
          >
            {lang === 'zh' ? '使用' : 'Try'}
          </Link>
          <Link
            href="/tools/kol-pricer/how"
            className="rounded-xl border border-surface-700 px-8 py-3 text-base font-medium text-surface-300 transition-all duration-300 hover:border-surface-500 hover:text-white hover:-translate-y-0.5"
          >
            {lang === 'zh' ? '工作原理' : 'How It Works'}
          </Link>
        </div>
      </div>


      {/* Features (scroll-reveal) */}
      <section ref={revealRef} data-reveal-group className="pb-12">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <div key={f.title} data-reveal>
              <FeatureCard title={f.title} description={f.description} icon={f.icon} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function FeatureCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div
      className="group relative cursor-pointer rounded-2xl border border-surface-800 bg-surface-900/50 p-6 transition-all duration-300 ease-out hover:-translate-y-2 hover:scale-[1.015] hover:border-brand-400/80 hover:bg-[#171717]"
      style={{
        boxShadow: "0 0 0 1px rgba(6,245,183,0)",
        transition: "all 300ms ease-out",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 0 0 1px rgba(6,245,183,0.28), 0 0 36px rgba(6,245,183,0.22), 0 24px 80px rgba(6,245,183,0.16)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "0 0 0 1px rgba(6,245,183,0)";
      }}
    >
      {/* Radial highlight inside card */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-[radial-gradient(circle_at_65%_20%,rgba(6,245,183,0.18),transparent_38%)]" />
      {/* Top gradient highlight */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-[linear-gradient(180deg,rgba(6,245,183,0.06),transparent_35%)]" />
      <div className="relative">
        <div className="mb-4 inline-flex rounded-xl bg-brand-500/10 p-3 text-brand-500 transition-all duration-300 group-hover:bg-[#0a3329] group-hover:border group-hover:border-brand-400/45 group-hover:shadow-[0_0_24px_rgba(6,245,183,0.20)]">
          <div className="transition-all duration-300 group-hover:drop-shadow-[0_0_10px_rgba(6,245,183,0.7)]">
            {icon}
          </div>
        </div>
        <h3 className="text-lg font-semibold text-white transition-colors duration-300 group-hover:text-white">
          {title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-surface-400">
          {description}
        </p>
      </div>
    </div>
  );
}
