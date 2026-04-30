"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useLang } from "@/lib/use-lang";

const LINKS_EN = [
  { href: "/tools/kol-pricer", label: "Intro" },
  { href: "/tools/kol-pricer/tool", label: "Pricing Tool" },
  { href: "/tools/kol-pricer/how", label: "How It Works" },
  { href: "/tools/kol-pricer/faq", label: "FAQ" },
];

const LINKS_ZH = [
  { href: "/tools/kol-pricer", label: "介绍" },
  { href: "/tools/kol-pricer/tool", label: "定价工具" },
  { href: "/tools/kol-pricer/how", label: "工作原理" },
  { href: "/tools/kol-pricer/faq", label: "常见问题" },
];

export default function KolPricerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const lang = useLang();
  const links = lang === 'zh' ? LINKS_ZH : LINKS_EN;

  return (
    <div>
      <div className="mb-2">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-surface-500">
          {lang === 'zh' ? '工具包' : 'Toolkit'}
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-white">
          KOL <span className="text-brand-500">{lang === 'zh' ? '定价器' : 'Pricer'}</span>
        </h1>
      </div>

      <nav className="mb-8 flex gap-1 border-b border-surface-800">
        {links.map(({ href, label }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "-mb-px rounded-t-lg border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "border-brand-500 text-brand-500"
                  : "border-transparent text-surface-400 hover:bg-surface-800 hover:text-white"
              )}
            >
              {label}
            </Link>
          );
        })}
      </nav>

      {children}
    </div>
  );
}
