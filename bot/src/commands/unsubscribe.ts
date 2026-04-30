import type { Context } from 'telegraf';
import pool from '../db.js';

export async function unsubscribeCommand(ctx: Context) {
  const chatId = String(ctx.chat?.id);

  const { rowCount } = await pool.query(
    `UPDATE telegram_subscriptions
     SET is_active = false
     WHERE telegram_chat_id = $1`,
    [chatId]
  );

  if (!rowCount) {
    await ctx.reply('No active subscription found.');
    return;
  }

  await ctx.reply(
    '✅ You have been unsubscribed.\n\nUse /start to re-subscribe at any time.'
  );
}
