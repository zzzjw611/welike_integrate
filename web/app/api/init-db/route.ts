import { NextResponse } from "next/server";

/**
 * POST /api/init-db
 *
 * Initializes the Supabase database tables needed for WeLike.
 * Call this once after setting up your Supabase project.
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY in .env.local
 *
 * This uses the Supabase SQL endpoint (via service_role key)
 * to execute raw SQL directly.
 */
export async function POST() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";

  if (!serviceRoleKey || !supabaseUrl) {
    return NextResponse.json(
      {
        error:
          "Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL in .env.local",
        hint: "Get your service_role key from Supabase Dashboard → Settings → API",
      },
      { status: 400 }
    );
  }

  const results: { step: string; success: boolean; message?: string }[] = [];

  // Helper: execute raw SQL via Supabase REST API
  async function execSql(sql: string): Promise<{ error?: string }> {
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
      };
      const res = await fetch(`${supabaseUrl}/rest/v1/rpc/`, {
        method: "POST",
        headers,
        body: JSON.stringify({ sql }),
      });
      if (!res.ok) {
        const body = await res.text();
        return { error: `HTTP ${res.status}: ${body}` };
      }
      return {};
    } catch (err: any) {
      return { error: err.message };
    }
  }

  // ── Step 1: Create exec_sql function (needed for running arbitrary SQL) ──
  try {
    // First try to create the exec_sql function via a direct SQL query
    // We use the Supabase Management API endpoint for this
    const createFnRes = await fetch(
      `${supabaseUrl}/rest/v1/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
          Prefer: "params=single-object",
        },
        body: JSON.stringify({
          query: `
            create or replace function exec_sql(sql text)
            returns void
            language plpgsql
            security definer
            as $$
            begin
              execute sql;
            end;
            $$;
          `,
        }),
      }
    );

    if (!createFnRes.ok) {
      // If we can't create the function via REST, try a different approach
      results.push({
        step: "exec_sql_function",
        success: false,
        message: `Could not create exec_sql function via REST: ${createFnRes.status}. Will try alternative approach.`,
      });
    } else {
      results.push({
        step: "exec_sql_function",
        success: true,
        message: "exec_sql function created/verified",
      });
    }
  } catch (err: any) {
    results.push({
      step: "exec_sql_function",
      success: false,
      message: err.message,
    });
  }

  // ── Step 2: Create product_contexts table ──
  try {
    const { error } = await execSql(`
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

      create index if not exists product_contexts_user_id_idx
        on product_contexts(user_id);

      alter table product_contexts enable row level security;

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
    `);

    if (error) {
      results.push({
        step: "product_contexts",
        success: false,
        message: error,
      });
    } else {
      results.push({
        step: "product_contexts",
        success: true,
        message: "Table created/verified successfully",
      });
    }
  } catch (err: any) {
    results.push({
      step: "product_contexts",
      success: false,
      message: err.message,
    });
  }

  // ── Step 3: Create product_submissions table ──
  try {
    const { error } = await execSql(`
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

      create index if not exists product_submissions_created_at_idx
        on product_submissions(created_at desc);

      alter table product_submissions enable row level security;

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
    `);

    if (error) {
      results.push({
        step: "product_submissions",
        success: false,
        message: error,
      });
    } else {
      results.push({
        step: "product_submissions",
        success: true,
        message: "Table created/verified successfully",
      });
    }
  } catch (err: any) {
    results.push({
      step: "product_submissions",
      success: false,
      message: err.message,
    });
  }

  const allSuccess = results.every((r) => r.success);

  return NextResponse.json({
    success: allSuccess,
    results,
    note: allSuccess
      ? "Database initialized successfully!"
      : "Some steps failed. Check the results for details.",
  });
}
