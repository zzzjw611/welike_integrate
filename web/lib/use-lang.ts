import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import type { Lang } from '@/lib/types';

/**
 * Read the current language from the URL search param `?lang=en|zh`.
 * Falls back to the `lang` cookie, then to `'en'`.
 *
 * Uses a hydration-safe pattern: returns `'en'` during SSR and the first
 * client render, then switches to the real value after mount. This prevents
 * Next.js hydration mismatches when the cookie differs from the default.
 *
 * Must be called inside a client component wrapped in `<Suspense>` or
 * a component that is already inside a Suspense boundary (because
 * `useSearchParams` requires it).
 */
export function useLang(): Lang {
  const sp = useSearchParams();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // During SSR / first paint, always return 'en' so server and client
  // HTML match. After hydration we read the real value.
  const fromParam = sp?.get('lang');
  if (fromParam === 'en' || fromParam === 'zh') {
    if (!mounted) return 'en';
    return fromParam;
  }

  // fallback: read cookie (only on client after mount)
  if (mounted && typeof document !== 'undefined') {
    const match = document.cookie.match(/(?:^|;\s*)lang=(\w+)/);
    const fromCookie = match?.[1] as Lang | undefined;
    if (fromCookie === 'en' || fromCookie === 'zh') return fromCookie;
  }

  return 'en';
}
