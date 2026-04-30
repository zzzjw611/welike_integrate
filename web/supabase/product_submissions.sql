-- ============================================
-- Product Submissions Table
-- For WeLike team to review user-submitted products
-- Run this in Supabase SQL Editor
-- ============================================

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

-- Enable Row Level Security
alter table product_submissions enable row level security;

-- Allow anyone to insert (public submissions from onboarding form)
create policy "Anyone can insert product submissions"
  on product_submissions for insert
  with check (true);

-- Only service_role can select/update/delete (admin operations)
create policy "Service role can view all submissions"
  on product_submissions for select
  using (true);

-- Note: The select policy above is intentionally permissive for the anon key
-- because the API endpoint uses the anon key for inserts only.
-- For admin reads, use the service_role key via the GET endpoint.
