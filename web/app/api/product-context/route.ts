import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      userId,
      name,
      url,
      oneLiner,
      description,
      category,
      stage,
      targetAudience,
      targetRegions,
      competitors,
      language,
    } = body;

    if (!userId || !name || !oneLiner || !category) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Use service role key if available (bypasses RLS)
    // Otherwise fall back to anon key with auth.setSession()
    let supabase;
    if (serviceRoleKey) {
      supabase = createClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });
    } else {
      supabase = createClient(supabaseUrl, supabaseAnonKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });

      // Try to set the user session from the auth header
      const authHeader = req.headers.get("authorization");
      if (authHeader?.startsWith("Bearer ")) {
        const token = authHeader.slice(7);
        await supabase.auth.setSession({
          access_token: token,
          refresh_token: "",
        });
      }
    }

    // Insert a new version (history) instead of upsert
    const { error } = await supabase.from("product_contexts").insert({
      user_id: userId,
      name,
      url: url || null,
      one_liner: oneLiner,
      description: description || "",
      category,
      stage: stage || "",
      target_audience: targetAudience || "",
      target_regions: targetRegions || [],
      competitors: competitors || [],
      language: language || "en",
    });

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Product context API error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
