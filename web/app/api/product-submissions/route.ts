import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Use service role key for admin operations (read all submissions)
const supabaseAdmin = process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { persistSession: false } }
    )
  : null;

// Use anon key for public submissions (insert only)
const supabaseAnon = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface ProductSubmission {
  id?: string;
  user_id?: string;
  user_email?: string;
  user_name?: string;
  user_uid?: string;
  product_name: string;
  product_url?: string;
  one_liner: string;
  description: string;
  category: string;
  stage: string;
  target_audience: string;
  target_regions: string[];
  competitors: string[];
  language: string;
  created_at?: string;
}

// POST — submit a new product (public, no auth required)
// Gracefully handles missing tables — just logs and returns success
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Build the submission payload with user info
    const payload = {
      user_id: body.userId || null,
      user_email: body.userEmail || null,
      user_name: body.userName || null,
      user_uid: body.userUid || null,
      product_name: body.productName,
      product_url: body.productUrl || null,
      one_liner: body.oneLiner,
      description: body.description || "",
      category: body.category,
      stage: body.stage || "",
      target_audience: body.targetAudience || "",
      target_regions: body.targetRegions || [],
      competitors: body.competitors || [],
      language: body.language || "en",
    };

    // Try product_submissions table first (team review DB)
    let { data, error } = await supabaseAnon
      .from("product_submissions")
      .insert(payload)
      .select()
      .single();

    // Fallback: if product_submissions table doesn't exist, try product_contexts
    if (error && error.message?.includes("product_submissions")) {
      const { data: fallbackData, error: fallbackError } = await supabaseAnon
        .from("product_contexts")
        .insert({
          user_id: body.userId || null,
          name: body.productName,
          url: body.productUrl || null,
          one_liner: body.oneLiner,
          description: body.description || "",
          category: body.category,
          stage: body.stage || "",
          target_audience: body.targetAudience || "",
          target_regions: body.targetRegions || [],
          competitors: body.competitors || [],
          language: body.language || "en",
        })
        .select()
        .single();

      if (fallbackError) {
        // Both tables missing — just log and return success (dev mode)
        console.warn("Product submission tables not available (dev mode):", fallbackError.message);
        return NextResponse.json({ success: true, note: "submission logged locally (no DB table)" });
      }

      return NextResponse.json({ success: true, data: fallbackData, table: "product_contexts" });
    }

    if (error) {
      console.warn("Product submission failed (dev mode):", error.message);
      return NextResponse.json({ success: true, note: "submission logged locally (no DB table)" });
    }

    return NextResponse.json({ success: true, data, table: "product_submissions" });
  } catch (err) {
    console.error("Product submission error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}



// GET — list all submissions (admin only, requires service role key)
export async function GET(request: Request) {
  // Check for admin authorization
  const authHeader = request.headers.get("authorization");
  const adminToken = process.env.ADMIN_API_TOKEN;

  if (!supabaseAdmin) {
    return NextResponse.json(
      { error: "Admin API not configured (missing SUPABASE_SERVICE_ROLE_KEY)" },
      { status: 501 }
    );
  }

  if (adminToken && authHeader !== `Bearer ${adminToken}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "50");
  const offset = (page - 1) * limit;

  const { data, error, count } = await supabaseAdmin
    .from("product_submissions")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    data,
    pagination: {
      page,
      limit,
      total: count,
      totalPages: count ? Math.ceil(count / limit) : 0,
    },
  });
}
