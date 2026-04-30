import { Telegraf } from 'telegraf';
import { config } from './config.js';
import { startCommand } from './commands/start.js';
import { settingsCommand } from './commands/settings.js';
import { unsubscribeCommand } from './commands/unsubscribe.js';

const bot = new Telegraf(config.botToken);

bot.command('start',       startCommand);
bot.command('settings',    settingsCommand);
bot.command('unsubscribe', unsubscribeCommand);

bot.catch((err, ctx) => {
  console.error(`[Bot] Error for ${ctx.updateType}:`, err);
});

// Webhook mode — required by PRD (non-polling)
bot.launch({
  webhook: {
    domain: config.webhookUrl,
    port:   config.webhookPort,
  },
});

console.log(`[Bot] Webhook listening on port ${config.webhookPort}`);

process.once('SIGINT',  () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
