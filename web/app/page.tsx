"use client";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useEffect } from "react";
import { ArrowRight, Radio, BarChart3, Newspaper, Code, BookOpen, Users } from "lucide-react";
import Link from "next/link";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLang } from "@/lib/use-lang";

export default function Home() {
  const { user, productContext, isLoading } = useAuth();
  const router = useRouter();
  const lang = useLang();

  useEffect(() => {
    if (!isLoading && user) {
      if (productContext) {
        router.push("/workspace");
      } else {
        router.push("/onboarding");
      }
    }
  }, [user, productContext, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-950">
        <div className="h-8 w-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-950 text-white overflow-x-hidden">
      {/* ===== Navigation ===== */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-surface-950/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-8 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-brand-500 flex items-center justify-center">
              <span className="text-black font-bold text-base">W</span>
            </div>
            <span className="text-base font-semibold tracking-tight">WeLike</span>
          </div>

          {/* Right side — pill-shaped nav items */}
          <div className="flex items-center gap-2">
            <LanguageSwitcher current={lang} />
            <Link
              href="/login"
              className="rounded-full border border-surface-700 bg-surface-900/60 px-4 py-1.5 text-xs text-surface-400 hover:text-white hover:border-surface-600 transition-colors"
            >
              {lang === 'zh' ? '登录' : 'Sign in'}
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-brand-500 px-4 py-1.5 text-xs font-semibold text-black hover:bg-brand-400 transition-colors"
            >
              {lang === 'zh' ? '开始' : 'Get started'}
            </Link>
          </div>
        </div>
      </nav>

      {/* ===== Hero Section ===== */}
      <section className="relative mx-auto max-w-7xl px-8 pt-28 pb-16">
        {/* Large rounded hero container */}
        <div className="relative rounded-3xl border border-surface-800 bg-surface-950 overflow-hidden min-h-[75vh] flex items-center">
          {/* Background layers */}
          <div className="absolute inset-0">
            {/* Pixel grid — radial faded, lower opacity */}
            <div className="absolute inset-0 opacity-40" style={{
              maskImage: 'radial-gradient(ellipse at 30% 50%, black 20%, transparent 70%)',
              WebkitMaskImage: 'radial-gradient(ellipse at 30% 50%, black 20%, transparent 70%)',
            }}>
              <div className="pixel-grid" />
            </div>

            {/* Right-side signal/data matrix — abstract technical visual */}
            <div className="absolute top-0 right-0 w-[45%] h-full opacity-25 pointer-events-none overflow-hidden">
              {/* Vertical signal bars */}
              <div className="absolute inset-0 flex items-end justify-around pb-[15%]" style={{ gap: '2px' }}>
                {[12, 28, 8, 35, 18, 42, 22, 52, 15, 30, 10, 38, 20, 45, 25, 55, 14, 32, 18, 40].map((h, i) => (
                  <div
                    key={i}
                    className="w-[3px] bg-brand-500/30 rounded-t-sm"
                    style={{
                      height: `${h}%`,
                      animation: `signalBar ${2 + (i % 3) * 0.5}s ease-in-out infinite alternate`,
                      animationDelay: `${i * 0.12}s`,
                    }}
                  />
                ))}
              </div>
              {/* Horizontal scan line */}
              <div className="absolute top-1/3 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-500/20 to-transparent animate-pulse" style={{ animationDuration: '4s' }} />
              <div className="absolute top-2/3 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" style={{ animationDuration: '6s' }} />
              {/* Small data dots grid */}
              <div className="absolute bottom-[20%] right-[10%] grid grid-cols-6 gap-2 opacity-40">
                {Array.from({ length: 18 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-1 w-1 rounded-full bg-brand-500/40"
                    style={{
                      animation: `dotPulse ${1.5 + (i % 4) * 0.3}s ease-in-out infinite alternate`,
                      animationDelay: `${i * 0.15}s`,
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Readability mask — dark radial gradient behind headline area */}
            <div
              className="absolute inset-0 z-[2] pointer-events-none"
              style={{
                background: 'radial-gradient(circle at 28% 45%, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.48) 34%, rgba(0,0,0,0.06) 62%, rgba(0,0,0,0) 78%)',
              }}
            />

            {/* Enhanced 3-layer animated wave system with particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-[1]">
              <svg
                className="absolute inset-0 h-full w-full"
                viewBox="0 0 1600 900"
                preserveAspectRatio="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <filter id="waveGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="14" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                  <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="rgba(6,245,183,0.02)" />
                    <stop offset="35%" stopColor="rgba(6,245,183,0.12)" />
                    <stop offset="50%" stopColor="rgba(6,245,183,0.20)" />
                    <stop offset="70%" stopColor="rgba(6,245,183,0.10)" />
                    <stop offset="100%" stopColor="rgba(6,245,183,0.01)" />
                  </linearGradient>
                  <linearGradient id="thinWave" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="rgba(255,255,255,0.01)" />
                    <stop offset="50%" stopColor="rgba(6,245,183,0.10)" />
                    <stop offset="100%" stopColor="rgba(255,255,255,0.01)" />
                  </linearGradient>
                </defs>

                {/* Layer 1: Main blurred wave band */}
                <path
                  className="wave-band"
                  d="M -200 560 C 100 380, 320 720, 620 560 S 1080 390, 1380 560 S 1680 700, 1900 520"
                  fill="none"
                  stroke="url(#waveGradient)"
                  strokeWidth="48"
                  filter="url(#waveGlow)"
                  strokeLinecap="round"
                />

                {/* Layer 2: Sharp main stroke */}
                <path
                  className="wave-main"
                  d="M -200 560 C 100 380, 320 720, 620 560 S 1080 390, 1380 560 S 1680 700, 1900 520"
                  fill="none"
                  stroke="rgba(6,245,183,0.55)"
                  strokeWidth="3"
                  strokeLinecap="round"
                />

                {/* Layer 3a: Secondary wave — upper */}
                <path
                  className="wave-secondary-1"
                  d="M -200 500 C 80 420, 320 620, 610 500 S 1060 420, 1360 520 S 1660 640, 1880 510"
                  fill="none"
                  stroke="url(#thinWave)"
                  strokeWidth="2"
                  strokeLinecap="round"
                />

                {/* Layer 3b: Secondary wave — lower */}
                <path
                  className="wave-secondary-2"
                  d="M -200 640 C 90 560, 300 760, 620 650 S 1080 520, 1400 660 S 1680 760, 1910 620"
                  fill="none"
                  stroke="rgba(255,255,255,0.07)"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />

                {/* Animated particles along wave path — live data transmission dots */}
                <circle className="wave-particle-1" cx="200" cy="480" r="2" fill="#06f5b7" opacity="0.6" />
                <circle className="wave-particle-2" cx="500" cy="560" r="1.5" fill="#06f5b7" opacity="0.5" />
                <circle className="wave-particle-3" cx="800" cy="480" r="2.5" fill="#06f5b7" opacity="0.4" />
                <circle className="wave-particle-4" cx="1100" cy="560" r="1.8" fill="#ffffff" opacity="0.3" />
                <circle className="wave-particle-5" cx="1400" cy="520" r="2" fill="#06f5b7" opacity="0.35" />
              </svg>
            </div>

            {/* Neural dot cluster — top right */}
            <div className="absolute top-0 right-0 w-96 h-96 opacity-25">
              <div className="bg-neural w-full h-full" />
            </div>
            {/* Subtle brand gradient glow — bottom left */}
            <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-brand-500/4 rounded-full blur-3xl" />
          </div>

          {/* Content */}
          <div className="relative z-10 px-12 md:px-20 py-24 w-full">
            <div className="max-w-3xl">
              {/* Badge — more technical */}
              <div className="inline-flex items-center gap-2 border border-surface-700/50 rounded-full px-3.5 py-1 mb-8">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-500 animate-pulse" style={{ animationDuration: '2s' }} />
                <span className="text-[11px] text-surface-500 tracking-widest uppercase font-medium">
                  {lang === 'zh' ? 'AI 产品的 GTM 工作台' : 'GTM Workspace for AI Products'}
                </span>
                <span className="text-[10px] text-surface-600 ml-1 font-mono">v0.1</span>
              </div>

              {/* Headline — oversized editorial */}
              <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold leading-[0.92] tracking-[-0.055em] mb-8">
                {lang === 'zh' ? (
                  <>
                    你的 AI 产品
                    <br />
                    <span className="text-gradient">颠覆性</span>
                    <br />
                    你的 GTM 也
                    <br />
                    应该如此
                  </>
                ) : (
                  <>
                    Your AI is
                    <br />
                    <span className="text-gradient">groundbreaking</span>
                    <br />
                    Your GTM
                    <br />
                    should be too.
                  </>
                )}
              </h1>

              {/* Subtitle */}
              <p className="text-base md:text-lg text-surface-500 font-light leading-relaxed max-w-xl mb-10">
                {lang === 'zh'
                  ? 'WeLike — AI 产品的 GTM 工作台。源自 100+ 次产品发布实战打磨的策略与工具。'
                  : 'WeLike is the GTM workspace for AI products. Battle-tested playbooks and tools from 100+ launches.'}
              </p>

              {/* CTA — compact technical */}
              <div className="flex items-center gap-4">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-5 py-2.5 text-xs font-semibold text-black hover:bg-brand-400 transition-colors glow-brand"
                >
                  {lang === 'zh' ? '开始' : 'Start'}
                  <ArrowRight className="h-3 w-3" />
                </Link>
                <span className="text-[11px] text-surface-600 font-mono tracking-wide">
                  {lang === 'zh' ? '无需信用卡' : 'No credit card required'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Why WeLike — Minimal Cards ===== */}
      <section className="mx-auto max-w-7xl px-8 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: Code,
              title: lang === 'zh' ? '为 AI 产品而生，非通用 SaaS' : 'Built for AI products, not generic SaaS',
              desc: lang === 'zh'
                ? '我们理解开发者营销、GitHub 存在感、API 文档、开源动态和开发者社区互动 — 因为这是我们专注的全部。'
                : "We understand developer marketing, GitHub presence, API docs, open-source dynamics, and dev community engagement — because that's all we do.",
            },
            {
              icon: BookOpen,
              title: lang === 'zh' ? '来自 100+ 次发布的剧本' : 'Playbooks from 100+ launches',
              desc: lang === 'zh'
                ? '每个工具都编码了 JE Labs 在前沿 AI 项目发布中积累的真实 GTM 经验 — 而非理论框架。'
                : "Every tool encodes real GTM know-how from JE Labs' experience launching frontier AI projects — not theoretical frameworks.",
            },
            {
              icon: Users,
              title: lang === 'zh' ? '工具 + 策略，而非仅仪表盘' : 'Tools + strategy, not just dashboards',
              desc: lang === 'zh'
                ? '超越分析。获取可执行的 GTM 计划、定位策略和可发布的内容 — 全部基于实际有效的方法。'
                : "Go beyond analytics. Get actionable GTM plans, positioning strategies, and ready-to-ship content — all informed by what actually works.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="group rounded-2xl border border-surface-800 bg-surface-900/50 p-8 hover:border-brand-500/20 hover:bg-surface-900 transition-all duration-300"
            >
              <div className="h-10 w-10 rounded-xl border border-surface-700 bg-surface-800/50 flex items-center justify-center mb-5 group-hover:border-brand-500/30 group-hover:bg-brand-500/5 transition-colors">
                <f.icon className="h-5 w-5 text-brand-500" />
              </div>
              <h3 className="text-base font-semibold mb-3 leading-snug text-white">{f.title}</h3>
              <p className="text-sm text-surface-500 leading-relaxed font-light">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== Tools Section ===== */}
      <section className="mx-auto max-w-7xl px-8 pb-28">
        <div className="mb-10">
          <h2 className="text-2xl font-bold mb-2 tracking-tight">
            {lang === 'zh' ? '你的 GTM 工具包' : 'Your GTM toolkit'}
          </h2>
          <p className="text-sm text-surface-500 font-light">
            {lang === 'zh' ? '从市场研究到发布日及以后，你需要的每个工具。' : 'Every tool you need, from market research to launch day and beyond.'}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            {
              icon: Radio,
              title: lang === 'zh' ? '社交聆听' : 'Social Listening',
              desc: lang === 'zh' ? '跨 X、Reddit 和开发者社区的实时情感追踪。' : "Real-time sentiment tracking across X, Reddit & dev communities.",
            },
            {
              icon: BarChart3,
              title: lang === 'zh' ? 'KOL 定价器' : 'KOL Pricer',
              desc: lang === 'zh' ? '影响者和 KOL 合作的智能定价基准。' : "Smart pricing benchmarks for influencer & KOL partnerships.",
            },
            {
              icon: Newspaper,
              title: lang === 'zh' ? 'AI 新闻' : 'AI News',
              desc: lang === 'zh' ? '每日 AI 情报，追踪新闻、融资和新工具。' : "Daily AI intelligence tracking news, funding, and new tools.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="group rounded-2xl border border-surface-800 bg-surface-900/30 p-7 hover:border-surface-700 hover:bg-surface-900/60 transition-all duration-300"
            >
              <div className="h-10 w-10 rounded-xl border border-surface-700 bg-surface-800/30 flex items-center justify-center mb-4 group-hover:border-brand-500/30 group-hover:bg-brand-500/5 transition-colors">
                <f.icon className="h-5 w-5 text-brand-500" />
              </div>
              <h3 className="text-sm font-semibold mb-2 text-white">{f.title}</h3>
              <p className="text-sm text-surface-500 font-light leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== Footer ===== */}
      <footer className="border-t border-surface-800">
        <div className="mx-auto max-w-7xl px-8 py-8 flex items-center justify-between">
          <p className="text-xs text-surface-600">&copy; 2026 WeLike by JE Labs</p>
          <p className="text-xs text-surface-600 font-light">
            {lang === 'zh' ? '为 AI 构建者而生。' : 'Built for the AI builders.'}
          </p>
        </div>
      </footer>
    </div>
  );
}
