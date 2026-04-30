import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379', {
  lazyConnect: true,
  maxRetriesPerRequest: 3,
});

redis.on('error', (err) => {
  if (process.env.NODE_ENV !== 'production') return;
  console.error('[Redis]', err.message);
});

export default redis;

export const CACHE_TTL = {
  daily: 3600,       // 1 hour — today's content
  archive: 86400,    // 24 hours — historical content
} as const;

export async function getCache<T>(key: string): Promise<T | null> {
  try {
    const value = await redis.get(key);
    return value ? (JSON.parse(value) as T) : null;
  } catch {
    return null;
  }
}

export async function setCache(key: string, value: unknown, ttl: number = CACHE_TTL.daily): Promise<void> {
  try {
    await redis.setex(key, ttl, JSON.stringify(value));
  } catch {
    // cache miss is non-fatal
  }
}

// PRD-specified cache key format: articles:YYYY-MM-DD
export function dailyKey(date: string) {
  return `articles:${date}`;
}
