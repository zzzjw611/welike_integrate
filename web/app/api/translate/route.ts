import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

export async function POST(req: NextRequest) {
  const { text, targetLang } = await req.json() as { text: string; targetLang: 'zh' | 'en' };

  if (!text || !targetLang) {
    return NextResponse.json({ error: 'text and targetLang required' }, { status: 400 });
  }

  const langLabel = targetLang === 'zh' ? 'Simplified Chinese' : 'English';

  // Use Haiku 4.5 for translation (PRD 12.1 — lightweight model for translation)
  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 2048,
    messages: [
      {
        role: 'user',
        content: `Translate the following text to ${langLabel}. Return only the translated text, no explanation.\n\n${text}`,
      },
    ],
  });

  const translated = message.content[0].type === 'text' ? message.content[0].text : '';
  return NextResponse.json({ translated });
}
