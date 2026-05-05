-- ============================================
-- AI News Publishing Table
-- Tracks which issues are published (visible to public)
-- ============================================

create table if not exists news_publishing (
  id uuid primary key default gen_random_uuid(),
  date text not null unique,
  published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Index for fast lookup
create index if not exists news_publishing_date_idx
  on news_publishing(date desc);

create index if not exists news_publishing_published_idx
  on news_publishing(published);

-- Row Level Security
alter table news_publishing enable row level security;

-- RLS Policies
do $$
begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'news_publishing' and policyname = 'Anyone can view published news'
  ) then
    create policy "Anyone can view published news"
      on news_publishing for select
      using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where tablename = 'news_publishing' and policyname = 'Service role can insert news publishing'
  ) then
    create policy "Service role can insert news publishing"
      on news_publishing for insert
      with check (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where tablename = 'news_publishing' and policyname = 'Service role can update news publishing'
  ) then
    create policy "Service role can update news publishing"
      on news_publishing for update
      using (true);
  end if;
end $$;

-- Auto-update updated_at
drop trigger if exists news_publishing_updated_at on news_publishing;
create trigger news_publishing_updated_at
  before update on news_publishing
  for each row execute function update_updated_at();
</｜｜DSML｜｜parameter>
</｜｜DSML｜｜invoke>
</｜｜DSML｜｜tool_calls>