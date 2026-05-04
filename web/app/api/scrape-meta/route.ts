import { NextRequest, NextResponse } from 'next/server';

function extractMeta(html: string, regex: RegExp): string | null {
  const match = html.match(regex);
  return match?.[1]?.trim() || null;
}

function extractTitle(html: string): string {
  // Priority 1: og:title
  const og = extractMeta(html, /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i);
  if (og) return og;

  // Priority 2: twitter:title
  const tw = extractMeta(html, /<meta[^>]+name=["']twitter:title["'][^>]+content=["']([^"']+)["']/i);
  if (tw) return tw;

  // Priority 3: <title> tag
  const title = extractMeta(html, /<title>([^<]+)<\/title>/i);
  if (title) return title;

  // Priority 4: first <h1> tag
  const h1 = extractMeta(html, /<h1[^>]*>([^<]+)<\/h1>/i);
  if (h1) return h1;

  return '';
}

function extractDescription(html: string): string {
  // Priority 1: og:description
  const og = extractMeta(html, /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i);
  if (og) return og;

  // Priority 2: <meta name="description">
  const meta = extractMeta(html, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i);
  if (meta) return meta;

  // Priority 3: twitter:description
  const tw = extractMeta(html, /<meta[^>]+name=["']twitter:description["'][^>]+content=["']([^"']+)["']/i);
  if (tw) return tw;

  // Priority 4: JSON-LD structured data
  const jsonLdMatch = html.match(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([^<]+)<\/script>/i);
  if (jsonLdMatch) {
    try {
      const parsed = JSON.parse(jsonLdMatch[1]);
      const desc = parsed?.description || parsed?.abstract || '';
      if (desc && typeof desc === 'string' && desc.length > 10) return desc.trim();
    } catch {
      // not valid JSON, skip
    }
  }

  // Priority 5: first meaningful <p> tag content (up to 200 chars)
  const pMatch = html.match(/<p[^>]*>([^<]+)<\/p>/i);
  if (pMatch) {
    const text = pMatch[1].trim();
    if (text.length > 20) {
      return text.length > 200 ? text.slice(0, 200) + '...' : text;
    }
  }

  return '';
}

function extractImage(html: string): string {
  // Priority 1: og:image
  const og = extractMeta(html, /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
  if (og) return og;

  // Priority 2: twitter:image
  const tw = extractMeta(html, /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i);
  if (tw) return tw;

  // Priority 3: favicon
  const icon = extractMeta(html, /<link[^>]+rel=["'](?:shortcut )?icon["'][^>]+href=["']([^"']+)["']/i);
  if (icon) return icon;

  return '';
}

export async function POST(req: NextRequest) {
  const { url } = await req.json() as { url: string };

  if (!url) {
    return NextResponse.json({ error: 'url required' }, { status: 400 });
  }

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; WeLikeBot/1.0)',
        'Accept': 'text/html',
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      return NextResponse.json({ error: `Failed to fetch: ${res.status}` }, { status: 502 });
    }

    const html = await res.text();

    return NextResponse.json({
      title: extractTitle(html),
      description: extractDescription(html),
      image: extractImage(html),
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to scrape metadata' },
      { status: 500 }
    );
  }
}
