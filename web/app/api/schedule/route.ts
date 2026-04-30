import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Use /tmp on Vercel (ephemeral but writable); fall back to cwd for local dev
const FILE = process.env.VERCEL
  ? '/tmp/schedule.json'
  : path.join(process.cwd(), 'schedule.json');

type Schedule = {
  enabled: boolean; time: string; sections: string[];
  lang: string; token: string; chatId: string; lastSentDate: string;
};

function load(): Schedule {
  const defaults: Schedule = {
    enabled: false, time: '09:00', sections: ['news'],
    lang: 'zh', token: '', chatId: '', lastSentDate: '',
  };
  try {
    if (fs.existsSync(FILE)) return { ...defaults, ...JSON.parse(fs.readFileSync(FILE, 'utf8')) };
  } catch {}
  return defaults;
}

export async function GET() {
  const { token: _t, ...safe } = load();
  return NextResponse.json(safe);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  try {
    fs.writeFileSync(FILE, JSON.stringify({ ...load(), ...body }, null, 2));
  } catch (err) {
    console.error('[schedule] write failed:', err);
    return NextResponse.json({ ok: false, error: 'Failed to save' }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
