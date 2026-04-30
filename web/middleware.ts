import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

type Lang = 'en' | 'zh';

// Priority: URL param > cookie > Accept-Language > 'en'
function resolveLang(
  urlParam: string | null,
  cookie: string | undefined,
  acceptLanguage: string | null,
): Lang {
  if (urlParam === 'en' || urlParam === 'zh') return urlParam;
  if (cookie === 'en' || cookie === 'zh') return cookie;
  return acceptLanguage?.toLowerCase().includes('zh') ? 'zh' : 'en';
}

export function middleware(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const urlLang   = searchParams.get('lang');
  const cookieLang = request.cookies.get('lang')?.value;
  const acceptLang = request.headers.get('accept-language');

  const lang = resolveLang(urlLang, cookieLang, acceptLang);

  // Rewrite to inject ?lang= if absent or invalid (URL stays clean for user)
  let response: NextResponse;
  if (urlLang !== lang) {
    const url = request.nextUrl.clone();
    url.searchParams.set('lang', lang);
    response = NextResponse.rewrite(url);
  } else {
    response = NextResponse.next();
  }

  // Sync cookie whenever it differs from resolved lang (1-year TTL)
  if (cookieLang !== lang) {
    response.cookies.set('lang', lang, {
      path:     '/',
      maxAge:   365 * 24 * 60 * 60,
      sameSite: 'lax',
    });
  }

  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon\\.ico).*)'],
};
