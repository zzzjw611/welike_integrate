'use client';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import type { Lang } from '@/lib/types';

interface Props {
  current: Lang;
}

export default function LanguageSwitcher({ current }: Props) {
  const router      = useRouter();
  const pathname    = usePathname();
  const searchParams = useSearchParams();

  function switchLang(lang: Lang) {
    // Write cookie client-side for double coverage (middleware also syncs server-side)
    document.cookie = `lang=${lang}; path=/; max-age=${365 * 24 * 60 * 60}; SameSite=Lax`;
    const params = new URLSearchParams(searchParams.toString());
    params.set('lang', lang);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex items-center gap-1 bg-surface-800 rounded-full p-1">
      {(['en', 'zh'] as Lang[]).map((l) => (
        <button
          key={l}
          onClick={() => switchLang(l)}
          className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
            current === l
              ? 'bg-brand-500 text-black'
              : 'text-surface-400 hover:text-white'
          }`}
        >
          {l === 'en' ? 'EN' : '中'}
        </button>
      ))}
    </div>
  );
}
