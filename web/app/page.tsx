"use client";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useEffect } from "react";


import { ArrowRight, Radio, BarChart3, Newspaper, Code, BookOpen, Users } from "lucide-react";
import Link from "next/link";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import CursorGlow from "@/components/CursorGlow";
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
      {/* Cursor glow — refined, small, only on hover-target elements */}
      <CursorGlow />

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
              className="hover-target rounded-full border border-surface-700 bg-surface-900/60 px-4 py-1.5 text-xs text-surface-400 hover:text-white hover:border-surface-600 transition-colors"
            >
              {lang === 'zh' ? '登录' : 'Sign in'}
            </Link>
            <Link
              href="/register"
              className="hover-target rounded-full bg-brand-500 px-4 py-1.5 text-xs font-semibold text-black hover:bg-brand-400 transition-colors"
            >
              {lang === 'zh' ? '开始' : 'Get started'}
            </Link>

          </div>
        </div>
      </nav>

      {/* ===== Hero Section ===== */}
      <section className="relative mx-auto max-w-7xl px-8 pt-28 pb-16">
        {/* Large rounded hero container — enhanced panel */}
        <div className="hover-target relative rounded-3xl border border-white/[0.07] bg-surface-950 overflow-hidden min-h-[75vh] flex items-center shadow-[inset_0_0_80px_rgba(6,245,183,0.03)]">


          {/* Panel seam — subtle vertical division between text and tech areas */}
          <div className="absolute left-[52%] top-[10%] bottom-[10%] w-px bg-gradient-to-b from-transparent via-white/[0.03] to-transparent z-[3] pointer-events-none" />

          {/* Background layers */}
          <div className="absolute inset-0 entrance-background">
            {/* Noise grain overlay */}
            <div className="noise-overlay absolute inset-0" />

            {/* Pixel grid — radial faded, lower opacity, with breathing */}
            <div className="absolute inset-0 grid-breathe" style={{
              maskImage: 'radial-gradient(ellipse at 30% 50%, black 20%, transparent 70%)',
              WebkitMaskImage: 'radial-gradient(ellipse at 30% 50%, black 20%, transparent 70%)',
            }}>
              <div className="pixel-grid" />
            </div>


            {/* Right-side signal/data matrix — richer, more layered */}
            <div className="absolute top-0 right-0 w-[48%] h-full opacity-30 pointer-events-none overflow-hidden">
              {/* Right-side dark tech panel overlay */}
              <div className="absolute inset-0 bg-gradient-to-l from-surface-950/40 via-surface-950/10 to-transparent" />
              {/* Faint dot matrix / signal field — right side */}
              <div className="absolute inset-0" style={{
                backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(6,245,183,0.06) 1px, transparent 1px)',
                backgroundSize: '28px 28px',
                maskImage: 'radial-gradient(ellipse at 70% 50%, black 30%, transparent 70%)',
                WebkitMaskImage: 'radial-gradient(ellipse at 70% 50%, black 30%, transparent 70%)',
              }} />
              {/* Vertical signal bars — varied widths and opacities */}
              <div className="absolute inset-0 flex items-end justify-around pb-[12%]" style={{ gap: '1px' }}>
                {[8, 32, 12, 42, 15, 48, 20, 58, 10, 35, 8, 45, 18, 52, 22, 62, 12, 38, 14, 48].map((h, i) => (
                  <div
                    key={i}
                    className="rounded-t-sm"
                    style={{
                      width: i % 3 === 0 ? '4px' : i % 3 === 1 ? '2px' : '3px',
                      height: `${h}%`,
                      background: i % 2 === 0
                        ? `linear-gradient(to top, rgba(6,245,183,0.08), rgba(6,245,183,${0.15 + (h / 200)}))`
                        : `linear-gradient(to top, rgba(255,255,255,0.04), rgba(255,255,255,${0.06 + (h / 300)}))`,
                      animation: `signalBar ${1.8 + (i % 4) * 0.4}s ease-in-out infinite alternate`,
                      animationDelay: `${i * 0.1}s`,
                    }}
                  />
                ))}
              </div>
              {/* Horizontal scan lines */}
              <div className="absolute top-1/4 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-500/15 to-transparent animate-pulse" style={{ animationDuration: '3.5s' }} />
              <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent animate-pulse" style={{ animationDuration: '5s' }} />
              <div className="absolute top-3/4 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-500/10 to-transparent animate-pulse" style={{ animationDuration: '4.2s' }} />
              {/* Data dots grid — bottom right */}
              <div className="absolute bottom-[15%] right-[8%] grid grid-cols-8 gap-1.5 opacity-35">
                {Array.from({ length: 32 }).map((_, i) => (
                  <div
                    key={i}
                    className="rounded-full"
                    style={{
                      width: i % 3 === 0 ? '2px' : '1.5px',
                      height: i % 3 === 0 ? '2px' : '1.5px',
                      background: i % 2 === 0 ? 'rgba(6,245,183,0.5)' : 'rgba(255,255,255,0.3)',
                      animation: `dotPulse ${1.2 + (i % 5) * 0.25}s ease-in-out infinite alternate`,
                      animationDelay: `${i * 0.1}s`,
                    }}
                  />
                ))}
              </div>
              {/* Tech annotation lines — faint crosshair marks */}
              <div className="absolute top-[18%] right-[22%] w-3 h-3 opacity-20">
                <div className="absolute top-1/2 left-0 right-0 h-px bg-brand-500/40" />
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-brand-500/40" />
              </div>
              <div className="absolute bottom-[30%] right-[35%] w-2 h-2 opacity-15">
                <div className="absolute top-1/2 left-0 right-0 h-px bg-white/30" />
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/30" />
              </div>
            </div>

            {/* Large ambient glow fields */}
            {/* 1. Ribbon-area glow — mid-right */}
            <div className="absolute top-[35%] right-[20%] w-[40%] h-[40%] bg-brand-500/5 rounded-full blur-[120px] pointer-events-none" />
            {/* 2. Bottom-right energy field */}
            <div className="absolute bottom-[5%] right-[10%] w-[30%] h-[30%] bg-brand-500/4 rounded-full blur-[100px] pointer-events-none" />
            {/* 3. Top-right ambient */}
            <div className="absolute top-[5%] right-[5%] w-[25%] h-[25%] bg-brand-500/3 rounded-full blur-[80px] pointer-events-none" />

            {/* Readability mask — dark radial gradient behind headline area */}
            <div
              className="absolute inset-0 z-[2] pointer-events-none"
              style={{
                background: 'radial-gradient(circle at 28% 45%, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.48) 34%, rgba(0,0,0,0.06) 62%, rgba(0,0,0,0) 78%)',
              }}
            />

            {/* ===== NEW: Large flowing ribbon system — bigger presence ===== */}

            <div className="absolute inset-0 overflow-hidden pointer-events-none z-[0]">
              <svg
                className="absolute inset-0 h-full w-full"
                viewBox="0 0 1600 900"
                preserveAspectRatio="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <filter id="bigRibbonGlow" x="-30%" y="-30%" width="160%" height="160%">
                    <feGaussianBlur stdDeviation="28" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                  <filter id="bigRibbonBlur" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="18" />
                  </filter>
                  {/* Big glow body — edge-faded mint */}
                  <linearGradient id="bigGlowBody" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="rgba(6,245,183,0.01)" />
                    <stop offset="20%" stopColor="rgba(6,245,183,0.04)" />
                    <stop offset="40%" stopColor="rgba(6,245,183,0.10)" />
                    <stop offset="55%" stopColor="rgba(6,245,183,0.14)" />
                    <stop offset="70%" stopColor="rgba(6,245,183,0.08)" />
                    <stop offset="100%" stopColor="rgba(6,245,183,0.01)" />
                  </linearGradient>
                  {/* Main ribbon band */}
                  <linearGradient id="bigRibbonBand" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="rgba(6,245,183,0.01)" />
                    <stop offset="25%" stopColor="rgba(6,245,183,0.08)" />
                    <stop offset="45%" stopColor="rgba(6,245,183,0.18)" />
                    <stop offset="55%" stopColor="rgba(6,245,183,0.22)" />
                    <stop offset="70%" stopColor="rgba(6,245,183,0.10)" />
                    <stop offset="100%" stopColor="rgba(6,245,183,0.01)" />
                  </linearGradient>
                  {/* Sharp signal line */}
                  <linearGradient id="bigSignalLine" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="rgba(6,245,183,0.01)" />
                    <stop offset="30%" stopColor="rgba(6,245,183,0.30)" />
                    <stop offset="50%" stopColor="rgba(6,245,183,0.55)" />
                    <stop offset="70%" stopColor="rgba(6,245,183,0.30)" />
                    <stop offset="100%" stopColor="rgba(6,245,183,0.01)" />
                  </linearGradient>
                </defs>

                {/* Layer 1: Big glow body — wide, soft, ambient energy field */}
                <path
                  className="big-ribbon-glow"
                  d="M -300 650 C 50 420, 200 780, 500 620 S 900 380, 1200 580 S 1500 720, 1900 550"
                  fill="none"
                  stroke="url(#bigGlowBody)"
                  strokeWidth="120"
                  filter="url(#bigRibbonBlur)"
                  strokeLinecap="round"
                />

                {/* Layer 2: Main ribbon band — structured flow */}
                <path
                  className="big-ribbon-band"
                  d="M -300 650 C 50 420, 200 780, 500 620 S 900 380, 1200 580 S 1500 720, 1900 550"
                  fill="none"
                  stroke="url(#bigRibbonBand)"
                  strokeWidth="18"
                  filter="url(#bigRibbonGlow)"
                  strokeLinecap="round"
                />

                {/* Layer 3: Sharp signal line — precision trace */}
                <path
                  className="big-ribbon-signal"
                  d="M -300 650 C 50 420, 200 780, 500 620 S 900 380, 1200 580 S 1500 720, 1900 550"
                  fill="none"
                  stroke="url(#bigSignalLine)"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            {/* ===== EXISTING: 3-layer animated wave system with particles ===== */}
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
                  <linearGradient id="ribbonGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="rgba(6,245,183,0.01)" />
                    <stop offset="25%" stopColor="rgba(6,245,183,0.08)" />
                    <stop offset="45%" stopColor="rgba(6,245,183,0.18)" />
                    <stop offset="55%" stopColor="rgba(6,245,183,0.22)" />
                    <stop offset="70%" stopColor="rgba(6,245,183,0.12)" />
                    <stop offset="100%" stopColor="rgba(6,245,183,0.01)" />
                  </linearGradient>
                  <linearGradient id="ribbonBand" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="rgba(6,245,183,0.02)" />
                    <stop offset="30%" stopColor="rgba(6,245,183,0.15)" />
                    <stop offset="50%" stopColor="rgba(6,245,183,0.28)" />
                    <stop offset="70%" stopColor="rgba(6,245,183,0.15)" />
                    <stop offset="100%" stopColor="rgba(6,245,183,0.02)" />
                  </linearGradient>
                  <linearGradient id="signalLine" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="rgba(6,245,183,0.02)" />
                    <stop offset="35%" stopColor="rgba(6,245,183,0.50)" />
                    <stop offset="50%" stopColor="rgba(6,245,183,0.75)" />
                    <stop offset="65%" stopColor="rgba(6,245,183,0.50)" />
                    <stop offset="100%" stopColor="rgba(6,245,183,0.02)" />
                  </linearGradient>

                </defs>

                {/* Layer 1: Soft glow ribbon — wide, blurred, edge-faded */}
                <path
                  className="wave-band"
                  d="M -200 560 C 100 380, 320 720, 620 560 S 1080 390, 1380 560 S 1680 700, 1900 520"
                  fill="none"
                  stroke="url(#ribbonGlow)"
                  strokeWidth="56"
                  filter="url(#waveGlow)"
                  strokeLinecap="round"
                />

                {/* Layer 2: Main ribbon band — more visible, edge-faded */}
                <path
                  className="wave-main"
                  d="M -200 560 C 100 380, 320 720, 620 560 S 1080 390, 1380 560 S 1680 700, 1900 520"
                  fill="none"
                  stroke="url(#ribbonBand)"
                  strokeWidth="6"
                  strokeLinecap="round"
                />

                {/* Layer 3: Sharp signal line — thin, bright, edge-faded */}
                <path
                  className="wave-secondary-1"
                  d="M -200 560 C 100 380, 320 720, 620 560 S 1080 390, 1380 560 S 1680 700, 1900 520"
                  fill="none"
                  stroke="url(#signalLine)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />

                {/* Secondary wave — upper, subtle */}
                <path
                  className="wave-secondary-2"
                  d="M -200 500 C 80 420, 320 620, 610 500 S 1060 420, 1360 520 S 1660 640, 1880 510"
                  fill="none"
                  stroke="rgba(255,255,255,0.06)"
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

            {/* Scanning sweep — ultra-slow vertical light sweep across right area */}
            <div className="absolute top-0 right-0 w-[30%] h-full overflow-hidden pointer-events-none z-[1]">
              <div className="scanning-sweep absolute inset-0 bg-gradient-to-r from-transparent via-brand-500/[0.04] to-transparent" />
            </div>

            {/* Drifting particles — slow floating dots near ribbon area */}
            <div className="absolute inset-0 pointer-events-none z-[1] overflow-hidden">
              <div className="drift-particle-1 absolute top-[30%] right-[25%] w-1 h-1 rounded-full bg-brand-500/30" />
              <div className="drift-particle-2 absolute top-[50%] right-[35%] w-[3px] h-[3px] rounded-full bg-white/20" />
              <div className="drift-particle-3 absolute top-[65%] right-[20%] w-[2px] h-[2px] rounded-full bg-brand-500/25" />
              <div className="drift-particle-4 absolute top-[40%] right-[40%] w-[2px] h-[2px] rounded-full bg-brand-500/20" />
              <div className="drift-particle-5 absolute top-[55%] right-[15%] w-1 h-1 rounded-full bg-white/15" />
              <div className="drift-particle-6 absolute top-[70%] right-[30%] w-[2px] h-[2px] rounded-full bg-brand-500/20" />
            </div>
          </div>



          {/* Content — left-center composition */}
          <div className="relative z-10 px-12 md:px-20 py-24 w-full md:w-[88%] md:ml-[6%]">
            <div className="max-w-3xl">

              {/* Badge — more technical, with scanning light */}
              <div className="entrance-badge hover-target inline-flex items-center gap-2 border border-surface-700/50 rounded-full px-3.5 py-1 mb-8 relative overflow-hidden transition-all duration-300 hover:border-brand-500/40">
                {/* Scanning light across badge */}
                <div className="badge-scan absolute inset-0 bg-gradient-to-r from-transparent via-brand-500/20 to-transparent pointer-events-none" />
                <span className="relative h-1.5 w-1.5 rounded-full bg-brand-500 animate-pulse" style={{ animationDuration: '2s' }} />
                <span className="relative text-[11px] text-surface-500 tracking-widest uppercase font-medium">
                  {lang === 'zh' ? 'AI 产品的 GTM 工作台' : 'GTM Workspace for AI Products'}
                </span>
                <span className="relative text-[10px] text-surface-600 ml-1 font-mono">v0.1</span>
              </div>

              {/* Headline — oversized editorial */}
              <h1 className="entrance-headline text-6xl md:text-7xl lg:text-8xl font-bold leading-[0.92] tracking-[-0.055em] mb-8">
                {lang === 'zh' ? (
                  <>
                    你的 AI 产品
                    <br />
                    <span className="text-gradient gradient-shift">颠覆性</span>
                    <br />
                    你的 GTM 也
                    <br />
                    应该如此
                  </>
                ) : (
                  <>
                    Your AI is
                    <br />
                    <span className="text-gradient gradient-shift">groundbreaking</span>
                    <br />
                    Your GTM
                    <br />
                    should be too.
                  </>
                )}
              </h1>

              {/* Subtitle */}
              <p className="entrance-subtitle text-base md:text-lg text-surface-500 font-light leading-relaxed max-w-xl mb-10">
                {lang === 'zh'
                  ? 'WeLike — AI 产品的 GTM 工作台。源自 100+ 次产品发布实战打磨的策略与工具。'
                  : 'WeLike is the GTM workspace for AI products. Battle-tested playbooks and tools from 100+ launches.'}
              </p>

              {/* CTA — clean, with micro-interactions */}
              <div className="entrance-cta flex items-center gap-4">
                <Link
                  href="/register"
                  className="hover-target group inline-flex items-center gap-2 rounded-full bg-brand-500 px-5 py-2.5 text-xs font-semibold text-black transition-all duration-300 ease-out hover:bg-brand-400 hover:scale-[1.02] hover:shadow-[0_0_24px_rgba(6,245,183,0.35)]"
                >
                  {lang === 'zh' ? '开始' : 'Start'}
                  <ArrowRight className="h-3 w-3 transition-all duration-300 ease-out group-hover:translate-x-[3px]" />
                </Link>
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
              className="hover-target group relative cursor-pointer rounded-2xl border border-surface-800 bg-surface-900/50 p-8 transition-all duration-300 ease-out hover:-translate-y-2 hover:border-brand-500/60 hover:bg-surface-900 hover:shadow-[0_0_0_1px_rgba(6,245,183,0.15),0_24px_80px_rgba(6,245,183,0.12)]"
            >

              {/* Hover radial highlight */}
              <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-[radial-gradient(circle_at_70%_20%,rgba(6,245,183,0.12),transparent_38%)]" />
              <div className="relative z-10">
                <div className="h-10 w-10 rounded-xl border border-surface-700 bg-surface-800/50 flex items-center justify-center mb-5 transition-all duration-300 ease-out group-hover:border-brand-500/50 group-hover:bg-brand-500/10 group-hover:shadow-[0_0_24px_rgba(6,245,183,0.2)]">
                  <f.icon className="h-5 w-5 text-brand-500 transition-all duration-300 group-hover:drop-shadow-[0_0_8px_rgba(6,245,183,0.75)]" />
                </div>
                <h3 className="text-base font-semibold mb-3 leading-snug text-white">{f.title}</h3>
                <p className="text-sm text-surface-500 leading-relaxed font-light">{f.desc}</p>
              </div>
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
              className="hover-target group relative cursor-pointer rounded-2xl border border-surface-800 bg-surface-900/30 p-7 transition-all duration-300 ease-out hover:-translate-y-2 hover:border-brand-500/60 hover:bg-surface-900/60 hover:shadow-[0_0_0_1px_rgba(6,245,183,0.15),0_24px_80px_rgba(6,245,183,0.12)]"
            >

              {/* Hover radial highlight */}
              <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-[radial-gradient(circle_at_70%_20%,rgba(6,245,183,0.12),transparent_38%)]" />
              <div className="relative z-10">
                <div className="h-10 w-10 rounded-xl border border-surface-700 bg-surface-800/30 flex items-center justify-center mb-4 transition-all duration-300 ease-out group-hover:border-brand-500/50 group-hover:bg-brand-500/10 group-hover:shadow-[0_0_24px_rgba(6,245,183,0.2)]">
                  <f.icon className="h-5 w-5 text-brand-500 transition-all duration-300 group-hover:drop-shadow-[0_0_8px_rgba(6,245,183,0.75)]" />
                </div>
                <h3 className="text-sm font-semibold mb-2 text-white">{f.title}</h3>
                <p className="text-sm text-surface-500 font-light leading-relaxed">{f.desc}</p>
              </div>
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
