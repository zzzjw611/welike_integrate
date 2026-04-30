import 'dotenv/config';

function required(key: string): string {
  const val = process.env[key];
  if (!val) throw new Error(`Missing required env var: ${key}`);
  return val;
}

export const config = {
  botToken:    required('TELEGRAM_BOT_TOKEN'),
  webhookUrl:  required('WEBHOOK_URL'),
  webhookPort: parseInt(process.env.BOT_PORT ?? '3001', 10),
  databaseUrl: required('DATABASE_URL'),
  webBaseUrl:  process.env.WEB_BASE_URL ?? 'https://ai-marketer-daily.vercel.app',
} as const;
