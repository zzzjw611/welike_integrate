import Link from 'next/link';
import { Suspense } from 'react';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import type { Lang } from '@/lib/types';

interface Props {
  children: React.ReactNode;
  lang: Lang;
}

export default function Layout({ children, lang }: Props) {
  return (
    <div className="min-h-screen bg-surface-950 text-surface-100">
      <header className="border-b border-surface-800 sticky top-0 z-50 bg-surface-950/90 backdrop-blur">
        <div className="mx-auto max-w-3xl px-6 py-4 flex items-center justify-between">
          <Link href={`/?lang=${lang}`} className="flex items-center gap-2">
            <span className="font-bold text-sm tracking-tight text-white">
              AI Marketer Daily
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href={`/archive?lang=${lang}`}
              className="text-xs text-surface-500 hover:text-white transition-colors"
            >
              {lang === 'zh' ? '历史归档' : 'Archive'}
            </Link>
            <Suspense>
              <LanguageSwitcher current={lang} />
            </Suspense>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-6 py-10">{children}</main>
      <footer className="border-t border-surface-800 mt-20">
        <div className="mx-auto max-w-3xl px-6 py-6 text-xs text-surface-600 flex justify-between">
          <span>AI Marketer Daily by JE Labs</span>
          <span>{lang === 'zh' ? '仅供内部使用' : 'Internal use only'}</span>
        </div>
      </footer>
    </div>
  );
}
