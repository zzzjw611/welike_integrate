-- ============================================
-- Product Contexts Table — RLS Policies
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable RLS on the table (if not already enabled)
alter table product_contexts enable row level security;

-- Allow authenticated users to insert their own product contexts
create policy "Users can insert their own product contexts"
  on product_contexts for insert
  with check (auth.uid() = user_id);

-- Allow authenticated users to view their own product contexts
create policy "Users can view their own product contexts"
  on product_contexts for select
  using (auth.uid() = user_id);

-- Allow authenticated users to delete their own product contexts
create policy "Users can delete their own product contexts"
  on product_contexts for delete
  using (auth.uid() = user_id);
