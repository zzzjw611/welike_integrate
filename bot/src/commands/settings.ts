import type { Context } from 'telegraf';
import pool from '../db.js';

export async function settingsCommand(ctx: Context) {
  const chatId = String(ctx.chat?.id);

  const { rows } = await pool.query(
    `SELECT ts.language, ts.timezone, ts.push_time, ts.is_active
     FROM telegram_subscriptions ts
     WHERE ts.telegram_chat_id = $1`,
    [chatId]
  );

  if (!rows.length) {
    await ctx.reply('No subscription found. Use /start to subscribe.');
    return;
  }

  const sub  = rows[0];
  const lang = sub.language as 'en' | 'zh';

  const msg = lang === 'zh'
    ? `⚙️ <b>当前设置</b>\n\n🌐 语言：${lang === 'zh' ? '中文' : 'English'}\n⏰ 推送时间：${sub.push_time}\n🕐 时区：${sub.timezone}\n\n如需修改，请回复以下指令：\n• 切换语言：/lang_en 或 /lang_zh\n• 修改时间：/time 08:00`
    : `⚙️ <b>Your Settings</b>\n\n🌐 Language: ${lang === 'zh' ? 'Chinese' : 'English'}\n⏰ Push time: ${sub.push_time}\n🕐 Timezone: ${sub.timezone}\n\nTo change:\n• Switch language: /lang_en or /lang_zh\n• Change time: /time 08:00`;

  await ctx.replyWithHTML(msg);
}
