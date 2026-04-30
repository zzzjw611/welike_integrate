-- ============================================
-- WeLike Database Initialization Script
-- Run this in Supabase SQL Editor
-- ============================================

-- ── 1. Product Contexts Table ──
-- Stores each user's product information
create table if not exists product_contexts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  name text not null,
  url text,
  one_liner text not null,
  description text default '',
  category text not null,
  stage text default '',
  target_audience text default '',
  target_regions text[] default '{}',
  competitors text[] default '{}',
  language text default 'en',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Index for fast user lookup
create index if not exists product_contexts_user_id_idx
  on product_contexts(user_id);

-- Row Level Security
alter table product_contexts enable row level security;

-- RLS Policies
do $$
begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'product_contexts' and policyname = 'Users can view own product context'
  ) then
    create policy "Users can view own product context"
      on product_contexts for select
      using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where tablename = 'product_contexts' and policyname = 'Users can insert own product context'
  ) then
    create policy "Users can insert own product context"
      on product_contexts for insert
      with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where tablename = 'product_contexts' and policyname = 'Users can update own product context'
  ) then
    create policy "Users can update own product context"
      on product_contexts for update
      using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where tablename = 'product_contexts' and policyname = 'Users can delete own product context'
  ) then
    create policy "Users can delete own product context"
      on product_contexts for delete
      using (auth.uid() = user_id);
  end if;
end $$;

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists product_contexts_updated_at on product_contexts;
create trigger product_contexts_updated_at
  before update on product_contexts
  for each row execute function update_updated_at();


-- ── 2. Product Submissions Table ──
-- For WeLike team to review user-submitted products
create table if not exists product_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  user_email text,
  user_name text,
  user_uid text,
  product_name text not null,
  product_url text,
  one_liner text not null,
  description text default '',
  category text not null,
  stage text default '',
  target_audience text default '',
  target_regions text[] default '{}',
  competitors text[] default '{}',
  language text default 'en',
  created_at timestamptz default now()
);

-- Index for sorting by newest first
create index if not exists product_submissions_created_at_idx
  on product_submissions(created_at desc);

-- Row Level Security
alter table product_submissions enable row level security;

-- RLS Policies
do $$
begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'product_submissions' and policyname = 'Anyone can insert product submissions'
  ) then
    create policy "Anyone can insert product submissions"
      on product_submissions for insert
      with check (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where tablename = 'product_submissions' and policyname = 'Service role can view all submissions'
  ) then
    create policy "Service role can view all submissions"
      on product_submissions for select
      using (true);
  end if;
end $$;
