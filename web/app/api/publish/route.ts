import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import redis, { dailyKey } from '@/lib/redis';

export async function POST(req: NextRequest) {
  const { date } = await req.json() as { date: string };

  if (!date) return NextResponse.json({ error: 'date required' }, { status: 400 });

  await pool.query(
    `UPDATE articles
     SET published_at = NOW()
     WHERE date = $1 AND published_at IS NULL`,
    [date]
  );

  // Invalidate cache so next request fetches fresh data
  await redis.del(dailyKey(date));

  return NextResponse.json({ ok: true, date });
}
