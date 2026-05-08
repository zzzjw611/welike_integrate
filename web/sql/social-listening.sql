-- Social Listening — Postgres schema (sl_* prefix to avoid collisions)
-- Idempotent: every CREATE uses IF NOT EXISTS. Run via /api/social-listening/init-db.

create table if not exists sl_user (
  chat_id     bigint primary key,
  username    text,
  first_name  text,
  lang        text,
  tz          text,
  created_at  timestamptz not null default now()
);

create table if not exists sl_alert (
  id                bigserial primary key,
  chat_id           bigint not null references sl_user(chat_id) on delete cascade,
  handles_json      jsonb not null default '[]'::jsonb,
  keywords_json     jsonb not null default '[]'::jsonb,
  sentiment_filter  text not null default 'all',
  urgency_filter    text not null default 'all',
  digest_mode       boolean not null default false,
  active            boolean not null default true,
  interval_min      int not null default 10,
  created_at        timestamptz not null default now(),
  last_run_at       timestamptz
);
create index if not exists sl_alert_chat_id_idx on sl_alert(chat_id);
create index if not exists sl_alert_due_idx on sl_alert(active, last_run_at);

create table if not exists sl_pushed_tweet (
  id          bigserial primary key,
  alert_id    bigint not null references sl_alert(id) on delete cascade,
  tweet_id    text not null,
  pushed_at   timestamptz not null default now(),
  unique(alert_id, tweet_id)
);
create index if not exists sl_pushed_tweet_alert_idx on sl_pushed_tweet(alert_id);

create table if not exists sl_web_link (
  token        text primary key,
  chat_id      bigint,
  tz           text,
  created_at   timestamptz not null default now(),
  expires_at   timestamptz not null default (now() + interval '15 minutes'),
  consumed_at  timestamptz
);

create table if not exists sl_task (
  id              text primary key,
  status          text not null default 'pending',  -- pending | running | done | error
  progress        int not null default 0,
  message         text not null default '',
  query           text not null,
  time_range      text not null default '7d',
  max_tweets      int not null default 30,
  result_json     jsonb,
  timeline_json   jsonb,
  report_status   text not null default 'idle',     -- idle | running | done | error
  report_markdown text,
  dedupe_key      text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists sl_task_dedupe_idx on sl_task(dedupe_key, created_at desc);
create index if not exists sl_task_created_idx on sl_task(created_at desc);
