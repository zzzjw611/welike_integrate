import type { Context } from 'telegraf';
import pool from '../db.js';

export async function startCommand(ctx: Context) {
  const chatId = String(ctx.chat?.id);
  const lang   = ctx.from?.language_code?.startsWith('zh') ? 'zh' : 'en';

  // Upsert user
  const { rows } = await pool.query(
    `INSERT INTO users (language) VALUES ($1)
     ON CONFLICT DO NOTHING
     RETURNING id`,
    [lang]
  );
  const userId = rows[0]?.id;

  if (userId) {
    await pool.query(
      `INSERT INTO telegram_subscriptions
         (user_id, telegram_chat_id, language, timezone, push_time, is_active)
       VALUES ($1, $2, $3, 'Asia/Shanghai', '09:00', true)
       ON CONFLICT (telegram_chat_id) DO UPDATE
         SET is_active = true`,
      [userId, chatId, lang]
    );
  }

  const greeting = lang === 'zh'
    ? `👋 欢迎订阅 <b>AI Marketer Daily</b>！\n\n每天早上 9 点推送 AI 营销日报。\n\n🌐 语言：中文\n⏰ 时间：09:00 (Asia/Shanghai)\n\n使用 /settings 修改偏好，/unsubscribe 取消订阅。\n\n🧰 使用 /tools 打开 WeLike 工具台（Social Listening · KOL Pricer · AI News）。`
    : `👋 Welcome to <b>AI Marketer Daily</b>!\n\nYou'll receive a daily AI marketing digest every morning at 9 AM.\n\n🌐 Language: English\n⏰ Time: 09:00 (Asia/Shanghai)\n\nUse /settings to change preferences, /unsubscribe to cancel.\n\n🧰 Use /tools to open the WeLike Toolbox (Social Listening · KOL Pricer · AI News).`;


  await ctx.replyWithHTML(greeting);
}
