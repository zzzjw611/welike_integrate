"use client";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useEffect } from "react";
import { ArrowRight, Zap, Eye, BarChart3, Radio, BookOpen, Code, Users, Newspaper } from "lucide-react";
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-grid">
      {/* Nav */}
      <nav className="border-b border-surface-800">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-brand-500 flex items-center justify-center">
              <span className="text-black font-bold text-sm">W</span>
            </div>
            <span className="text-lg font-semibold tracking-tight">WeLike</span>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher current={lang} />
            <Link
              href="/login"
              className="text-sm text-surface-400 hover:text-white transition-colors px-4 py-2"
            >
              {lang === 'zh' ? '登录' : 'Sign in'}
            </Link>
            <Link
              href="/register"
              className="text-sm bg-brand-500 text-black font-medium px-4 py-2 rounded-lg hover:bg-brand-400 transition-colors"
            >
              {lang === 'zh' ? '开始' : 'Get started'}
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pt-24 pb-20">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-surface-900 border border-surface-800 rounded-full px-4 py-1.5 mb-6">
            <div className="h-1.5 w-1.5 rounded-full bg-brand-500 animate-pulse" />
            <span className="text-xs text-surface-400">
              {lang === 'zh' ? 'AI 产品的 GTM 工作台' : 'GTM Workspace for AI Products'}
            </span>
          </div>
          <h1 className="text-5xl font-bold leading-tight tracking-tight mb-6">
            {lang === 'zh' ? (
              <>你的 AI 产品颠覆性<br /><span className="text-gradient">你的 GTM 也应该如此</span></>
            ) : (
              <>Your AI is groundbreaking.<br /><span className="text-gradient">Your GTM should be too.</span></>
            )}
          </h1>
          <p className="text-lg text-surface-400 leading-relaxed mb-10 max-w-2xl" style={{ lineHeight: '1.75' }}>
            {lang === 'zh'
              ? 'WeLike — AI 产品的 GTM 工作台。源自 100+ 次产品发布实战打磨的策略与工具。'
              : 'WeLike is the GTM workspace for AI products. Battle-tested playbooks and tools from 100+ launches.'}
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-brand-500 text-black font-semibold px-6 py-3 rounded-lg hover:bg-brand-400 transition-colors"
            >
              {lang === 'zh' ? '开始' : 'Start'} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Why WeLike */}
      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
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
              className="bg-surface-900 border border-surface-800 rounded-xl p-6 hover:border-brand-500/30 hover:bg-surface-800 hover:shadow-lg hover:shadow-brand-500/5 hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className="h-10 w-10 rounded-lg bg-brand-500/10 flex items-center justify-center mb-4">
                <f.icon className="h-5 w-5 text-brand-500" />
              </div>
              <h3 className="font-bold mb-2 leading-snug">{f.title}</h3>
              <p className="text-sm text-surface-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tools */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">
            {lang === 'zh' ? '你的 GTM 工具包' : 'Your GTM toolkit'}
          </h2>
          <p className="text-surface-400 text-sm">
            {lang === 'zh' ? '从市场研究到发布日及以后，你需要的每个工具。' : 'Every tool you need, from market research to launch day and beyond.'}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              className="bg-surface-900 border border-surface-800 rounded-xl p-6 hover:border-brand-500/30 hover:bg-surface-800 hover:shadow-lg hover:shadow-brand-500/5 hover:-translate-y-0.5 transition-all duration-200 group"
            >
              <div className="h-10 w-10 rounded-lg bg-surface-800 flex items-center justify-center mb-4 group-hover:bg-brand-500/10 transition-colors">
                <f.icon className="h-5 w-5 text-brand-500" />
              </div>
              <h3 className="font-semibold mb-1.5">{f.title}</h3>
              <p className="text-sm text-surface-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-surface-800">
        <div className="mx-auto max-w-6xl px-6 py-6 flex items-center justify-between">
          <p className="text-xs text-surface-500">&copy; 2026 WeLike by JE Labs</p>
          <p className="text-xs text-surface-600">
            {lang === 'zh' ? '为 AI 构建者而生。' : 'Built for the AI builders.'}
          </p>
        </div>
      </footer>
    </div>
  );
}
