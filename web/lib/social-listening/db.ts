/**
 * Postgres persistence for the Social Listening module.
 *
 * Mirrors backend/db.py from welike-social-listening-main but on top of `pg` and
 * Postgres instead of SQLModel + SQLite. Uses sl_* prefixed tables so it never
 * collides with WeLike's existing tables (articles, content_candidates, etc.).
 *
 * Pool selection:
 *   - SOCIAL_LISTENING_DATABASE_URL takes precedence (lets ops route SL to a
 *     different host without disturbing the news DB).
 *   - Falls back to DATABASE_URL.
 *   - ?family=4 is appended to force IPv4 (Vercel can't reach IPv6-only hosts).
 */
import { Pool, type PoolClient } from "pg";

const RAW_URL =
  process.env.SOCIAL_LISTENING_DATABASE_URL || process.env.DATABASE_URL;

const CONNECTION_STRING = RAW_URL
  ? RAW_URL + (RAW_URL.includes("?") ? "&" : "?") + "family=4"
  : undefined;

let schemaInitPromise: Promise<void> | null = null;

export function assertDatabaseConfigured(): void {
  if (!RAW_URL) {
    throw new Error(
      "SOCIAL_LISTENING_DATABASE_URL or DATABASE_URL is not configured in this Vercel environment"
    );
  }
}

// One pool per process. Vercel cold starts get a fresh one each time.
const pool = new Pool({
  connectionString: CONNECTION_STRING,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

export async function query<T>(sql: string, params?: unknown[]): Promise<T[]> {
  const { rows } = await pool.query(sql, params);
  return rows as T[];
}

export async function exec(sql: string, params?: unknown[]): Promise<void> {
  await pool.query(sql, params);
}

export default pool;

// ────────────────────────────────────────────────────────────────────────────
// Constants — kept identical to backend/db.py
// ────────────────────────────────────────────────────────────────────────────

export const MAX_ALERTS_PER_USER = 1;
export const DEFAULT_INTERVAL_MIN = 10;
export const MIN_INTERVAL_MIN = 10;

export const SENTIMENT_ORDER = ["negative", "positive", "neutral"] as const;
export const URGENCY_ORDER = ["high", "medium", "low"] as const;

export type Sentiment = (typeof SENTIMENT_ORDER)[number];
export type Urgency = (typeof URGENCY_ORDER)[number];

/**
 * Validate + canonicalize a multi-select filter value coming from any client.
 *
 * Accepts: "all", a single value, or CSV ("positive,neutral").
 * Returns canonical string, or null if input is invalid. Mirrors the Python
 * `normalize_multi_filter` semantics one-for-one.
 */
export function normalizeMultiFilter(
  raw: unknown,
  canonicalOrder: readonly string[]
): string | null {
  if (typeof raw !== "string" || !raw) return null;
  const tokens = raw
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);
  if (tokens.length === 0) return null;
  if (tokens.includes("all")) {
    return tokens.length === 1 ? "all" : null;
  }
  const opts = new Set(canonicalOrder);
  if (!tokens.every((t) => opts.has(t))) return null;
  const seen = new Set(tokens);
  if (seen.size === opts.size && [...seen].every((t) => opts.has(t))) {
    return "all";
  }
  return canonicalOrder.filter((t) => seen.has(t)).join(",");
}

// ────────────────────────────────────────────────────────────────────────────
// Schema bootstrap (idempotent) — used by /api/social-listening/init-db
// ────────────────────────────────────────────────────────────────────────────

export const SCHEMA_SQL = `
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
  status          text not null default 'pending',
  progress        int not null default 0,
  message         text not null default '',
  query           text not null,
  time_range      text not null default '7d',
  max_tweets      int not null default 30,
  result_json     jsonb,
  timeline_json   jsonb,
  report_status   text not null default 'idle',
  report_markdown text,
  dedupe_key      text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists sl_task_dedupe_idx on sl_task(dedupe_key, created_at desc);
create index if not exists sl_task_created_idx on sl_task(created_at desc);
`;

export async function initSchema(): Promise<void> {
  assertDatabaseConfigured();
  // pg lets us send the whole multi-statement block in one query — no need to
  // split on ';' which would break the `default '[]'::jsonb` literal.
  await pool.query(SCHEMA_SQL);
}

export async function initSchemaOnce(): Promise<void> {
  if (!schemaInitPromise) {
    schemaInitPromise = initSchema().catch((err) => {
      schemaInitPromise = null;
      throw err;
    });
  }
  await schemaInitPromise;
}

// ────────────────────────────────────────────────────────────────────────────
// Row types
// ────────────────────────────────────────────────────────────────────────────

export interface UserRow {
  chat_id: string; // bigint comes back as string from pg by default
  username: string | null;
  first_name: string | null;
  lang: string | null;
  tz: string | null;
  created_at: string;
}

export interface AlertRow {
  id: string;
  chat_id: string;
  handles_json: string[]; // jsonb → array
  keywords_json: string[];
  sentiment_filter: string;
  urgency_filter: string;
  digest_mode: boolean;
  active: boolean;
  interval_min: number;
  created_at: string;
  last_run_at: string | null;
}

export interface AlertDict {
  id: number;
  chat_id: number;
  handles: string[];
  keywords: string[];
  sentiment_filter: string;
  urgency_filter: string;
  digest_mode: boolean;
  active: boolean;
  interval_min: number;
  created_at: string | null;
  last_run_at: string | null;
}

export interface WebLinkRow {
  token: string;
  chat_id: string | null;
  tz: string | null;
  created_at: string;
  expires_at: string;
  consumed_at: string | null;
}

export interface TaskRow {
  id: string;
  status: string;
  progress: number;
  message: string;
  query: string;
  time_range: string;
  max_tweets: number;
  result_json: unknown | null;
  timeline_json: unknown | null;
  report_status: string;
  report_markdown: string | null;
  dedupe_key: string | null;
  created_at: string;
  updated_at: string;
}

// ────────────────────────────────────────────────────────────────────────────
// Users
// ────────────────────────────────────────────────────────────────────────────

export async function upsertUser(
  chatId: number | string,
  username: string | null,
  firstName: string | null,
  lang: string | null,
  tz: string | null = null
): Promise<void> {
  // Don't clobber an existing tz with NULL — only update tz if a value is
  // provided. Username/first_name/lang follow same "only-if-provided" pattern.
  await pool.query(
    `insert into sl_user (chat_id, username, first_name, lang, tz)
     values ($1, $2, $3, $4, $5)
     on conflict (chat_id) do update set
       username   = coalesce($2, sl_user.username),
       first_name = coalesce($3, sl_user.first_name),
       lang       = coalesce($4, sl_user.lang),
       tz         = coalesce($5, sl_user.tz)`,
    [chatId, username, firstName, lang, tz]
  );
}

export async function setUserTz(
  chatId: number | string,
  tz: string
): Promise<boolean> {
  const res = await pool.query(
    `update sl_user set tz = $2 where chat_id = $1`,
    [chatId, tz]
  );
  return (res.rowCount ?? 0) > 0;
}

export async function getUser(
  chatId: number | string
): Promise<UserRow | null> {
  const rows = await query<UserRow>(
    `select chat_id::text, username, first_name, lang, tz, created_at
     from sl_user where chat_id = $1`,
    [chatId]
  );
  return rows[0] || null;
}

// ────────────────────────────────────────────────────────────────────────────
// Alerts
// ────────────────────────────────────────────────────────────────────────────

export async function countUserAlerts(
  chatId: number | string
): Promise<number> {
  const rows = await query<{ count: string }>(
    `select count(*) as count from sl_alert where chat_id = $1`,
    [chatId]
  );
  return Number(rows[0]?.count ?? 0);
}

export async function getUserAlerts(
  chatId: number | string
): Promise<AlertDict[]> {
  const rows = await query<AlertRow>(
    `select id::text, chat_id::text, handles_json, keywords_json, sentiment_filter,
            urgency_filter, digest_mode, active, interval_min,
            created_at, last_run_at
     from sl_alert
     where chat_id = $1
     order by id asc`,
    [chatId]
  );
  return rows.map(alertRowToDict);
}

export async function getActiveAlerts(): Promise<AlertDict[]> {
  const rows = await query<AlertRow>(
    `select id::text, chat_id::text, handles_json, keywords_json, sentiment_filter,
            urgency_filter, digest_mode, active, interval_min,
            created_at, last_run_at
     from sl_alert
     where active = true`
  );
  return rows.map(alertRowToDict);
}

/**
 * Active alerts that are due for another poll: never run before, OR last_run_at
 * older than `interval_min`. Ordered oldest-first so the cron tick services the
 * most-stale alerts first when budget is tight.
 */
export async function getAlertsDue(limit = 20): Promise<AlertDict[]> {
  const rows = await query<AlertRow>(
    `select id::text, chat_id::text, handles_json, keywords_json, sentiment_filter,
            urgency_filter, digest_mode, active, interval_min,
            created_at, last_run_at
     from sl_alert
     where active = true
       and (last_run_at is null
            or last_run_at < now() - (interval_min || ' minutes')::interval)
     order by coalesce(last_run_at, '-infinity'::timestamptz) asc
     limit $1`,
    [limit]
  );
  return rows.map(alertRowToDict);
}

export async function getAlert(
  alertId: number | string
): Promise<AlertDict | null> {
  const rows = await query<AlertRow>(
    `select id::text, chat_id::text, handles_json, keywords_json, sentiment_filter,
            urgency_filter, digest_mode, active, interval_min,
            created_at, last_run_at
     from sl_alert where id = $1`,
    [alertId]
  );
  return rows[0] ? alertRowToDict(rows[0]) : null;
}

export async function createAlert(
  chatId: number | string,
  handles: string[],
  keywords: string[],
  sentimentFilter = "all",
  urgencyFilter = "all",
  digestMode = false,
  intervalMin: number = DEFAULT_INTERVAL_MIN
): Promise<AlertDict> {
  const minutes = Math.max(MIN_INTERVAL_MIN, intervalMin);
  const rows = await query<AlertRow>(
    `insert into sl_alert (chat_id, handles_json, keywords_json,
                           sentiment_filter, urgency_filter, digest_mode,
                           interval_min)
     values ($1, $2::jsonb, $3::jsonb, $4, $5, $6, $7)
     returning id::text, chat_id::text, handles_json, keywords_json,
               sentiment_filter, urgency_filter, digest_mode, active,
               interval_min, created_at, last_run_at`,
    [
      chatId,
      JSON.stringify(handles),
      JSON.stringify(keywords),
      sentimentFilter,
      urgencyFilter,
      digestMode,
      minutes,
    ]
  );
  return alertRowToDict(rows[0]);
}

export interface AlertUpdate {
  handles?: string[];
  keywords?: string[];
  sentiment_filter?: string;
  urgency_filter?: string;
  digest_mode?: boolean;
  active?: boolean;
  interval_min?: number;
}

export async function updateAlert(
  alertId: number | string,
  fields: AlertUpdate
): Promise<AlertDict | null> {
  const sets: string[] = [];
  const params: unknown[] = [];
  let i = 1;

  if (fields.handles !== undefined) {
    sets.push(`handles_json = $${i++}::jsonb`);
    params.push(JSON.stringify(fields.handles));
  }
  if (fields.keywords !== undefined) {
    sets.push(`keywords_json = $${i++}::jsonb`);
    params.push(JSON.stringify(fields.keywords));
  }
  if (fields.sentiment_filter !== undefined) {
    sets.push(`sentiment_filter = $${i++}`);
    params.push(fields.sentiment_filter);
  }
  if (fields.urgency_filter !== undefined) {
    sets.push(`urgency_filter = $${i++}`);
    params.push(fields.urgency_filter);
  }
  if (fields.digest_mode !== undefined) {
    sets.push(`digest_mode = $${i++}`);
    params.push(fields.digest_mode);
  }
  if (fields.active !== undefined) {
    sets.push(`active = $${i++}`);
    params.push(fields.active);
  }
  if (fields.interval_min !== undefined) {
    sets.push(`interval_min = $${i++}`);
    params.push(Math.max(MIN_INTERVAL_MIN, fields.interval_min));
  }

  if (sets.length === 0) return getAlert(alertId);

  params.push(alertId);
  const rows = await query<AlertRow>(
    `update sl_alert set ${sets.join(", ")}
     where id = $${i}
     returning id::text, chat_id::text, handles_json, keywords_json,
               sentiment_filter, urgency_filter, digest_mode, active,
               interval_min, created_at, last_run_at`,
    params
  );
  return rows[0] ? alertRowToDict(rows[0]) : null;
}

export async function deleteAlert(
  alertId: number | string
): Promise<boolean> {
  // ON DELETE CASCADE in schema removes pushed_tweet rows.
  const res = await pool.query(`delete from sl_alert where id = $1`, [alertId]);
  return (res.rowCount ?? 0) > 0;
}

export async function updateAlertLastRun(
  alertId: number | string
): Promise<void> {
  await pool.query(
    `update sl_alert set last_run_at = now() where id = $1`,
    [alertId]
  );
}

function alertRowToDict(r: AlertRow): AlertDict {
  // pg returns jsonb columns as already-parsed JS values. Defensive parse in
  // case the row was hand-edited and stored as text.
  const handles = Array.isArray(r.handles_json)
    ? r.handles_json
    : typeof r.handles_json === "string"
    ? JSON.parse(r.handles_json)
    : [];
  const keywords = Array.isArray(r.keywords_json)
    ? r.keywords_json
    : typeof r.keywords_json === "string"
    ? JSON.parse(r.keywords_json)
    : [];
  return {
    id: Number(r.id),
    chat_id: Number(r.chat_id),
    handles,
    keywords,
    sentiment_filter: r.sentiment_filter || "all",
    urgency_filter: r.urgency_filter || "all",
    digest_mode: !!r.digest_mode,
    active: !!r.active,
    interval_min: r.interval_min,
    created_at: r.created_at ?? null,
    last_run_at: r.last_run_at ?? null,
  };
}

// ────────────────────────────────────────────────────────────────────────────
// Pushed-tweet dedupe
// ────────────────────────────────────────────────────────────────────────────

/**
 * Return the subset of `tweetIds` that have NOT been pushed for this alert.
 * Mirrors filter_new_tweet_ids in db.py.
 */
export async function filterNewTweetIds(
  alertId: number | string,
  tweetIds: string[]
): Promise<Set<string>> {
  if (tweetIds.length === 0) return new Set();
  const rows = await query<{ tweet_id: string }>(
    `select tweet_id from sl_pushed_tweet
     where alert_id = $1 and tweet_id = any($2::text[])`,
    [alertId, tweetIds]
  );
  const seen = new Set(rows.map((r) => r.tweet_id));
  return new Set(tweetIds.filter((id) => !seen.has(id)));
}

export async function markTweetsPushed(
  alertId: number | string,
  tweetIds: string[]
): Promise<void> {
  if (tweetIds.length === 0) return;
  // ON CONFLICT DO NOTHING — race-safe insert (alert_id, tweet_id) is a unique
  // constraint in the schema.
  const placeholders = tweetIds
    .map((_, idx) => `($1, $${idx + 2})`)
    .join(", ");
  await pool.query(
    `insert into sl_pushed_tweet (alert_id, tweet_id)
     values ${placeholders}
     on conflict (alert_id, tweet_id) do nothing`,
    [alertId, ...tweetIds]
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Web ↔ Bot pairing
// ────────────────────────────────────────────────────────────────────────────

export async function createWebLink(tz: string | null = null): Promise<string> {
  // 16 random bytes → 22-char base64url, like Python secrets.token_urlsafe(16).
  const token = randomToken(16);
  await pool.query(
    `insert into sl_web_link (token, tz) values ($1, $2)`,
    [token, tz]
  );
  return token;
}

export type ConsumeResult =
  | "ok"
  | "expired"
  | "not_found"
  | "already_consumed";

export async function consumeWebLink(
  token: string,
  chatId: number | string
): Promise<ConsumeResult> {
  // Use a single transaction so we can atomically lock the row and decide.
  const client: PoolClient = await pool.connect();
  try {
    await client.query("begin");
    const { rows } = await client.query<WebLinkRow>(
      `select token, chat_id::text, tz, created_at, expires_at, consumed_at
       from sl_web_link where token = $1 for update`,
      [token]
    );
    const link = rows[0];
    if (!link) {
      await client.query("rollback");
      return "not_found";
    }
    const linkChat = link.chat_id ? Number(link.chat_id) : null;
    if (link.consumed_at && linkChat !== Number(chatId)) {
      await client.query("rollback");
      return "already_consumed";
    }
    if (new Date(link.expires_at) < new Date()) {
      await client.query("rollback");
      return "expired";
    }
    await client.query(
      `update sl_web_link set chat_id = $1, consumed_at = now() where token = $2`,
      [chatId, token]
    );
    await client.query("commit");

    // Side-effect: copy the captured tz onto the user record (if any).
    if (link.tz) {
      // upsertUser may have already run from the webhook; setUserTz is a no-op
      // if the user row doesn't exist, so we don't risk a foreign-key error.
      await setUserTz(chatId, link.tz);
    }
    return "ok";
  } catch (err) {
    await client.query("rollback").catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}

export async function getWebLink(token: string): Promise<WebLinkRow | null> {
  const rows = await query<WebLinkRow>(
    `select token, chat_id::text, tz, created_at, expires_at, consumed_at
     from sl_web_link where token = $1`,
    [token]
  );
  return rows[0] || null;
}

// ────────────────────────────────────────────────────────────────────────────
// Tasks (replaces backend/main.py's in-memory `tasks` dict)
// ────────────────────────────────────────────────────────────────────────────

export interface TaskInput {
  id: string;
  query: string;
  time_range: string;
  max_tweets: number;
  dedupe_key: string | null;
}

export async function createTask(input: TaskInput): Promise<void> {
  await pool.query(
    `insert into sl_task (id, status, progress, message, query, time_range,
                          max_tweets, dedupe_key)
     values ($1, 'pending', 0, '', $2, $3, $4, $5)`,
    [input.id, input.query, input.time_range, input.max_tweets, input.dedupe_key]
  );
}

export interface TaskUpdateFields {
  status?: string;
  progress?: number;
  message?: string;
  result_json?: unknown;
  timeline_json?: unknown;
  report_status?: string;
  report_markdown?: string | null;
}

export async function updateTask(
  id: string,
  fields: TaskUpdateFields
): Promise<void> {
  const sets: string[] = ["updated_at = now()"];
  const params: unknown[] = [];
  let i = 1;

  if (fields.status !== undefined) {
    sets.push(`status = $${i++}`);
    params.push(fields.status);
  }
  if (fields.progress !== undefined) {
    sets.push(`progress = $${i++}`);
    params.push(fields.progress);
  }
  if (fields.message !== undefined) {
    sets.push(`message = $${i++}`);
    params.push(fields.message);
  }
  if (fields.result_json !== undefined) {
    sets.push(`result_json = $${i++}::jsonb`);
    params.push(JSON.stringify(fields.result_json));
  }
  if (fields.timeline_json !== undefined) {
    sets.push(`timeline_json = $${i++}::jsonb`);
    params.push(JSON.stringify(fields.timeline_json));
  }
  if (fields.report_status !== undefined) {
    sets.push(`report_status = $${i++}`);
    params.push(fields.report_status);
  }
  if (fields.report_markdown !== undefined) {
    sets.push(`report_markdown = $${i++}`);
    params.push(fields.report_markdown);
  }

  params.push(id);
  await pool.query(
    `update sl_task set ${sets.join(", ")} where id = $${i}`,
    params
  );
}

export async function getTask(id: string): Promise<TaskRow | null> {
  const rows = await query<TaskRow>(
    `select id, status, progress, message, query, time_range, max_tweets,
            result_json, timeline_json, report_status, report_markdown,
            dedupe_key, created_at, updated_at
     from sl_task where id = $1`,
    [id]
  );
  return rows[0] || null;
}

/**
 * Find the most recent task with this dedupe_key whose status is acceptable
 * (done/running/pending) and was created within the last hour. Used by analyze
 * to avoid re-running identical queries — mirrors the in-memory dedupe in
 * backend/main.py.
 */
export async function lookupDedupeTask(
  dedupeKey: string
): Promise<TaskRow | null> {
  const rows = await query<TaskRow>(
    `select id, status, progress, message, query, time_range, max_tweets,
            result_json, timeline_json, report_status, report_markdown,
            dedupe_key, created_at, updated_at
     from sl_task
     where dedupe_key = $1
       and status in ('pending', 'running', 'done')
       and created_at > now() - interval '1 hour'
     order by created_at desc
     limit 1`,
    [dedupeKey]
  );
  return rows[0] || null;
}

export async function saveTimeline(
  taskId: string,
  timelineJson: unknown
): Promise<void> {
  await pool.query(
    `update sl_task set timeline_json = $1::jsonb, updated_at = now()
     where id = $2`,
    [JSON.stringify(timelineJson), taskId]
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────────────

function randomToken(byteLen: number): string {
  // Node 18+ has globalThis.crypto.getRandomValues.
  const bytes = new Uint8Array(byteLen);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).crypto.getRandomValues(bytes);
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return Buffer.from(bin, "binary")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}
