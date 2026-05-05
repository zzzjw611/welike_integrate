"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import { cn } from "@/lib/utils";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLang } from "@/lib/use-lang";
import { ToastProvider } from "@/components/Toast";
import {
  Radio,
  DollarSign,
  LayoutGrid,
  LogOut,
  ChevronRight,
  ChevronDown,
  Newspaper,
  Menu,
  X,
} from "lucide-react";

const guideSections = [
  {
    id: "highlight",
    emoji: "✨",
    title: "Highlight Summary",
    desc: "Top AI marketing story of the day — the one thing you need to know.",
  },
  {
    id: "daily-brief",
    emoji: "📡",
    title: "Daily Brief",
    desc: "Quick-hit AI marketing news across product launches, policy shifts, and industry moves.",
  },
  {
    id: "growth-insight",
    emoji: "📈",
    title: "Growth Insight",
    desc: "Deep-dive analysis on growth strategies, distribution plays, and go-to-market tactics.",
  },
  {
    id: "launch-radar",
    emoji: "🚀",
    title: "Launch Radar",
    desc: "New AI product launches and feature releases worth watching.",
  },
  {
    id: "daily-case",
    emoji: "🎯",
    title: "Daily Case",
    desc: "Real-world marketing case study — what worked, what didn't, and why.",
  },
  {
    id: "past-issues",
    emoji: "📚",
    title: "Past Issues",
    desc: "Browse previous newsletters to catch up on what you missed.",
  },
];

function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, productContext, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [guideExpanded, setGuideExpanded] = useState(false);

  const currentLang = useLang();

  const isNewsActive = pathname === "/tools/news" || pathname.startsWith("/tools/news/");
  const isGuideActive = isNewsActive && guideExpanded;

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/");
    }
  }, [user, isLoading, router]);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isWorkspaceActive = pathname === "/workspace";

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="px-5 py-5 border-b border-surface-800">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-brand-500 flex items-center justify-center flex-shrink-0">
            <span className="text-black font-bold text-sm">W</span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">WeLike</p>
            <p className="text-[11px] text-surface-500 truncate">{currentLang === 'zh' ? 'AI 产品的 GTM 工作台' : 'GTM Workspace for AI Products'}</p>
          </div>
        </div>
      </div>

      {/* Current Project */}
      <div className="px-4 pt-5 pb-2">
        <p className="px-1 text-[11px] font-semibold uppercase tracking-widest text-surface-500 mb-3">
          {currentLang === 'zh' ? '当前项目' : 'Current Project'}
        </p>
        {productContext ? (
          <Link
            href="/onboarding"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-surface-200 hover:text-white hover:bg-surface-800 transition-colors"
          >
            <div className="h-7 w-7 rounded-md bg-brand-500 flex items-center justify-center flex-shrink-0">
              <span className="text-black font-bold text-xs">
                {productContext.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="flex-1 truncate font-medium">{productContext.name}</span>
            <ChevronRight className="h-4 w-4 text-surface-600" />
          </Link>
        ) : (
          <Link
            href="/onboarding"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-surface-400 hover:text-white hover:bg-surface-800 transition-colors"
          >
            <span className="text-brand-500 font-medium">{currentLang === 'zh' ? '+ 添加你的产品' : '+ Add your product'}</span>
          </Link>
        )}
      </div>

      {/* GTM Workspace */}
      <div className="px-4 py-2">
        <Link
          href="/workspace"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors relative",
            isWorkspaceActive
              ? "bg-brand-500/10 text-brand-500"
              : "text-surface-400 hover:text-white hover:bg-surface-800"
          )}
        >
          {isWorkspaceActive && (
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-brand-500 rounded-full sidebar-indicator" />
          )}
          <LayoutGrid className="h-4 w-4 flex-shrink-0" />
          <span className="flex-1 truncate">{currentLang === 'zh' ? 'GTM 工作台' : 'GTM Workspace'}</span>
        </Link>
      </div>

      {/* Divider */}
      <div className="px-5 py-2">
        <div className="border-t border-surface-800" />
      </div>

      {/* Toolkit and Playbook */}
      <div className="px-4 flex-1 overflow-y-auto">
        <p className="px-1 text-[11px] font-semibold uppercase tracking-widest text-surface-500 mb-3">
          {currentLang === 'zh' ? '工具集与策略指南' : 'Toolkit and Playbook'}
        </p>
        <div className="space-y-1">
          {[
            { href: "/tools/social-listening", label: currentLang === 'zh' ? '社交聆听' : 'Social Listening', icon: Radio },
            { href: "/tools/kol-pricer", label: currentLang === 'zh' ? 'KOL 定价器' : 'KOL Pricer', icon: DollarSign },
          ].map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors relative",
                  isActive
                    ? "bg-brand-500/10 text-brand-500"
                    : "text-surface-400 hover:text-white hover:bg-surface-800"
                )}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-brand-500 rounded-full sidebar-indicator" />
                )}
                <Icon className="h-4 w-4 flex-shrink-0" />
                <span className="flex-1 truncate">{item.label}</span>
              </Link>
            );
          })}

          {/* AI News with Guide submenu */}
          <div>
            <Link
              href="/tools/news"
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors relative",
                isNewsActive
                  ? "bg-brand-500/10 text-brand-500"
                  : "text-surface-400 hover:text-white hover:bg-surface-800"
              )}
            >
              {isNewsActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-brand-500 rounded-full sidebar-indicator" />
              )}
              <Newspaper className="h-4 w-4 flex-shrink-0" />
              <span className="flex-1 truncate">{currentLang === 'zh' ? 'AI 新闻' : 'AI News'}</span>
              {isNewsActive && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setGuideExpanded(!guideExpanded);
                  }}
                  className="p-1 -m-1 rounded hover:bg-surface-800 transition-colors"
                >
                  <ChevronDown
                    className={cn(
                      "h-3.5 w-3.5 flex-shrink-0 transition-transform duration-200",
                      guideExpanded && "rotate-180"
                    )}
                  />
                </button>
              )}
            </Link>

            {/* Guide submenu */}
            {isNewsActive && guideExpanded && (
              <div className="ml-2 mt-0.5 space-y-0.5">
                {guideSections.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => scrollToSection(s.id)}
                    className="w-full text-left flex items-start gap-2 rounded-lg border border-transparent px-3 py-2 hover:border-surface-800 hover:bg-surface-900/80 transition-all cursor-pointer group"
                  >
                    <span className="text-xs leading-none mt-0.5 flex-shrink-0">
                      {s.emoji}
                    </span>
                    <div className="min-w-0">
                      <p className="text-[11px] font-medium text-surface-400 group-hover:text-brand-500 transition-colors">
                        {s.title}
                      </p>
                      <p className="text-[10px] text-surface-600 leading-relaxed mt-0.5 line-clamp-2">
                        {s.desc}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Profile + Sign out */}
      <div className="px-4 py-3 border-t border-surface-800">
        {/* Profile block */}
        <div className="group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 cursor-pointer hover:bg-surface-800/80 hover:shadow-[inset_0_0_0_1px_rgba(6,245,183,0.12)] mb-1">
          {/* Avatar / initial badge */}
          <div className="h-8 w-8 rounded-full bg-surface-800 flex items-center justify-center flex-shrink-0 transition-all duration-200 group-hover:bg-surface-700 group-hover:shadow-[0_0_12px_rgba(6,245,183,0.15)]">
            <span className="text-xs font-semibold text-surface-300 group-hover:text-brand-500 transition-colors duration-200">
              {(user?.name || 'U').charAt(0).toUpperCase()}
            </span>
          </div>
          {/* Name + email */}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-surface-200 truncate group-hover:text-white transition-colors duration-200">
              {user?.name || 'WeLike User'}
            </p>
            <p className="text-[11px] text-surface-500 truncate">
              {user?.email || ''}
            </p>
          </div>
        </div>
        {/* Sign out */}
        <button
          onClick={async () => {
            await logout();
          }}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-surface-500 hover:text-red-400 hover:bg-surface-800/60 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          {currentLang === 'zh' ? '退出登录' : 'Sign out'}
        </button>
      </div>

    </>
  );

  return (
    <ToastProvider>
      <div className="min-h-screen flex">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar — desktop */}
        <aside className="hidden lg:flex w-72 border-r border-surface-800 flex-col flex-shrink-0 bg-surface-950">
          {sidebarContent}
        </aside>

        {/* Sidebar — mobile drawer */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-50 w-72 border-r border-surface-800 flex-col bg-surface-950 transform transition-transform duration-300 ease-in-out lg:hidden",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex items-center justify-end px-4 py-3 border-b border-surface-800">
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="text-surface-400 hover:text-white transition-colors p-1"
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          {sidebarContent}
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto min-w-0">
          <div className="sticky top-0 z-10 flex items-center justify-between px-4 sm:px-8 py-3 bg-surface-950/80 backdrop-blur-sm border-b border-surface-800">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-surface-400 hover:text-white transition-colors p-1 -ml-1"
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex-1 lg:flex-none" />
            <LanguageSwitcher current={currentLang} />
          </div>
          <div className="mx-auto max-w-5xl px-4 sm:px-8 py-8">{children}</div>
        </main>
      </div>
    </ToastProvider>
  );
}
