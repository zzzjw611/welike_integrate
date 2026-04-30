import { NextRequest, NextResponse } from 'next/server';
import { getDailyContent } from '@/lib/db';
import { getCache, setCache, dailyKey, CACHE_TTL } from '@/lib/redis';
import type { DailyContent } from '@/lib/types';

export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get('date')
    ?? new Date().toISOString().slice(0, 10);

  const cacheKey = dailyKey(date);
  const cached = await getCache<DailyContent>(cacheKey);
  if (cached) return NextResponse.json(cached);

  const content = await getDailyContent(date);
  const ttl = date === new Date().toISOString().slice(0, 10)
    ? CACHE_TTL.daily
    : CACHE_TTL.archive;
  await setCache(cacheKey, content, ttl);

  return NextResponse.json(content);
}
