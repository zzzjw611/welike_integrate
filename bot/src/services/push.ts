import { Telegraf } from 'telegraf';
import pool from '../db.js';
import { config } from '../config.js';
import { formatDailyMessage } from './formatter.js';
import type { DailyContent, Lang } from '../../../shared/types/index.js';

const bot = new Telegraf(config.botToken);

async function getDailyContent(date: string): Promise<DailyContent> {
  const { rows } = await pool.query(
    `SELECT * FROM articles
     WHERE date = $1 AND published_at IS NOT NULL
     ORDER BY section, order_in_section`,
    [date]
  );

  const content: DailyContent = {
    date,
    daily_brief: [],
    growth_insight: [],
    launch_radar: [],
    daily_case: [],
  };

  for (const row of rows) {
    content[row.section as keyof DailyContent].push(row);
  }

  return content;
}

export async function pushToSubscribers(date: string): Promise<void> {
  const { rows: subs } = await pool.query(
    `SELECT telegram_chat_id, language FROM telegram_subscriptions
     WHERE is_active = true`
  );

  if (!subs.length) return;

  const content = await getDailyContent(date);

  for (const sub of subs) {
    const lang   = (sub.language ?? 'en') as Lang;
    const chunks = formatDailyMessage(content, lang);

    for (const chunk of chunks) {
      try {
        await bot.telegram.sendMessage(sub.telegram_chat_id, chunk, {
          parse_mode: 'HTML',
          // @ts-expect-error telegraf type
          disable_web_page_preview: true,
        });
        await new Promise((r) => setTimeout(r, 50)); // rate limit
      } catch (err) {
        console.error(`[Push] Failed to send to ${sub.telegram_chat_id}:`, err);
      }
    }
  }

  console.log(`[Push] Sent to ${subs.length} subscribers for ${date}`);
}
