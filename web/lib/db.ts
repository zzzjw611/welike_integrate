import { Pool } from 'pg';
import type { Article, ContentCandidate, DailyContent } from '@/lib/types';

// Force IPv4 to avoid ENETUNREACH on Vercel (IPv6 not supported)
const DATABASE_URL = process.env.DATABASE_URL 
  ? process.env.DATABASE_URL + (process.env.DATABASE_URL.includes('?') ? '&' : '?') + 'family=4'
  : undefined;

const pool = new Pool({
  connectionString: DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export default pool;

export async function query<T>(sql: string, params?: unknown[]): Promise<T[]> {
  const { rows } = await pool.query(sql, params);
  return rows as T[];
}

export async function getDailyContent(date: string): Promise<DailyContent> {
  const rows = await query<Article>(
    `SELECT * FROM articles
     WHERE date = $1 AND published_at IS NOT NULL
     ORDER BY section, order_in_section`,
    [date]
  );

  const grouped: DailyContent = {
    date,
    daily_brief: [],
    growth_insight: [],
    launch_radar: [],
    daily_case: [],
  };

  for (const row of rows) {
    grouped[row.section].push(row);
  }

  return grouped;
}

export async function getMostRecentDate(): Promise<string | null> {
  const rows = await query<{ date: string }>(
    `SELECT date::text FROM articles
     WHERE published_at IS NOT NULL
     ORDER BY date DESC
     LIMIT 1`
  );
  return rows[0]?.date ?? null;
}

export async function getPublishedDates(): Promise<string[]> {
  const rows = await query<{ date: string }>(
    `SELECT DISTINCT date::text FROM articles
     WHERE published_at IS NOT NULL
     ORDER BY date DESC`
  );
  return rows.map(r => r.date);
}

export async function getCandidates(status = 'pending'): Promise<ContentCandidate[]> {
  return query<ContentCandidate>(
    `SELECT * FROM content_candidates
     WHERE status = $1
     ORDER BY suggested_section, (ai_score->>'impact')::int DESC`,
    [status]
  );
}
