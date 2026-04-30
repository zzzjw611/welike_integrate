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
              className="rounded-full border border-surface-700 bg-surface-900/60 px-5 py-2 text-sm text-surface-400 hover:text-white hover:border-surface-600 transition-colors"
            >
              {lang === 'zh' ? '登录' : 'Sign in'}
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-brand-500 px-5 py-2 text-sm font-semibold text-black hover:bg-brand-400 transition-colors"
            >
              {lang === 'zh' ? '开始' : 'Get started'}
            </Link>
          </div>
        </div>
      </nav>

      {/* ===== Hero Section ===== */}
      <section className="relative mx-auto max-w-7xl px-8 pt-28 pb-16">
        {/* Large rounded hero container */}
        <div className="relative rounded-3xl border border-surface-800 bg-surface-950 overflow-hidden min-h-[70vh] flex items-center">
          {/* Background — pixel grid + signal wave */}
          <div className="absolute inset-0">
            <div className="pixel-grid" />
            <div className="signal-wave" />

            {/* Animated SVG wave lines — live neural signal */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <svg
                className="absolute inset-0 w-full h-full"
                viewBox="0 0 1200 600"
                preserveAspectRatio="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Wave 1 — teal, slow, wider amplitude */}
                <path
                  className="animate-wave-1"
                  d="M-100 300 Q 50 180, 200 300 T 500 300 T 800 300 T 1100 300 T 1400 300"
                  fill="none"
                  stroke="#06f5b7"
                  strokeWidth="1.5"
                  opacity="0.08"
                  style={{ filter: 'blur(3px)' }}
                />
                {/* Wave 2 — white, even slower, different phase */}
                <path
                  className="animate-wave-2"
                  d="M-100 350 Q 100 240, 300 350 T 700 350 T 1100 350 T 1500 350"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="1"
                  opacity="0.05"
                  style={{ filter: 'blur(4px)' }}
                />
                {/* Wave 3 — teal, slowest, offset position */}
                <path
                  className="animate-wave-3"
                  d="M-100 250 Q 150 160, 400 250 T 900 250 T 1400 250"
                  fill="none"
                  stroke="#06f5b7"
                  strokeWidth="1"
                  opacity="0.06"
                  style={{ filter: 'blur(2px)' }}
                />
              </svg>
            </div>

            {/* Neural dot cluster — top right */}
            <div className="absolute top-0 right-0 w-96 h-96 opacity-30">
              <div className="bg-neural w-full h-full" />
            </div>
            {/* Subtle brand gradient glow — bottom left */}
            <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-brand-500/5 rounded-full blur-3xl" />
          </div>


          {/* Content */}
          <div className="relative z-10 px-12 md:px-20 py-20 w-full">
            <div className="max-w-3xl">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 border border-surface-700/60 rounded-full px-4 py-1.5 mb-8">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
                <span className="text-xs text-surface-500 tracking-wide uppercase">
                  {lang === 'zh' ? 'AI 产品的 GTM 工作台' : 'GTM Workspace for AI Products'}
                </span>
              </div>

              {/* Headline — oversized editorial */}
              <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold leading-[0.95] tracking-tight mb-8">
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
              <p className="text-base md:text-lg text-surface-500 font-light leading-relaxed max-w-xl mb-12">
                {lang === 'zh'
                  ? 'WeLike — AI 产品的 GTM 工作台。源自 100+ 次产品发布实战打磨的策略与工具。'
                  : 'WeLike is the GTM workspace for AI products. Battle-tested playbooks and tools from 100+ launches.'}
              </p>

              {/* CTA — compact technical */}
              <div className="flex items-center gap-4">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-black hover:bg-brand-400 transition-colors glow-brand"
                >
                  {lang === 'zh' ? '开始' : 'Start'}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <span className="text-xs text-surface-600">
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
