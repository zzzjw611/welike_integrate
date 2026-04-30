-- ============================================
-- WeLike Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Product Context table
create table if not exists product_contexts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
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

-- Each user can only have one product context (for now)
create unique index if not exists product_contexts_user_id_idx on product_contexts(user_id);

-- Row Level Security
alter table product_contexts enable row level security;

-- Users can only read/write their own product context
create policy "Users can view own product context"
  on product_contexts for select
  using (auth.uid() = user_id);

create policy "Users can insert own product context"
  on product_contexts for insert
  with check (auth.uid() = user_id);

create policy "Users can update own product context"
  on product_contexts for update
  using (auth.uid() = user_id);

create policy "Users can delete own product context"
  on product_contexts for delete
  using (auth.uid() = user_id);

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger product_contexts_updated_at
  before update on product_contexts
  for each row execute function update_updated_at();
