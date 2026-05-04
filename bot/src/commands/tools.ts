import type { Context } from 'telegraf';
import { Markup } from 'telegraf';
import { config } from '../config.js';

export async function toolsCommand(ctx: Context) {
  const lang = ctx.from?.language_code?.startsWith('zh') ? 'zh' : 'en';

  const baseUrl = config.webBaseUrl;

  const text = lang === 'zh'
    ? `🧰 <b>WeLike 工具台</b>\n\n点击下方按钮直达对应工具：`
    : `🧰 <b>WeLike Toolbox</b>\n\nTap a button to launch the tool:`;

  const keyboard = Markup.inlineKeyboard([
    [
      Markup.button.url('📡 Social Listening', `${baseUrl}/tools/social-listening`),
    ],
    [
      Markup.button.url('💰 KOL Pricer', `${baseUrl}/tools/kol-pricer`),
    ],
    [
      Markup.button.url('🤖 AI News', `${baseUrl}/tools/news`),
    ],
  ]);

  await ctx.replyWithHTML(text, keyboard);
}
