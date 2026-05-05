import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { date, published } = await req.json();

    if (!date) {
      return NextResponse.json(
        { error: "Missing date parameter" },
        { status: 400 }
      );
    }

    const supabase = getSupabase();

    // Check if a record already exists
    const { data: existing } = await supabase
      .from("news_publishing")
      .select("id")
      .eq("date", date)
      .single();

    if (existing) {
      // Update existing record
      const { error } = await supabase
        .from("news_publishing")
        .update({
          published,
          published_at: published ? new Date().toISOString() : null,
        })
        .eq("date", date);

      if (error) throw error;
    } else {
      // Insert new record
      const { error } = await supabase.from("news_publishing").insert({
        date,
        published,
        published_at: published ? new Date().toISOString() : null,
      });

      if (error) throw error;
    }

    return NextResponse.json({
      success: true,
      date,
      published,
    });
  } catch (err) {
    console.error("Error publishing news:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to publish" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const supabase = getSupabase();
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");

    if (date) {
      const { data, error } = await supabase
        .from("news_publishing")
        .select("*")
        .eq("date", date)
        .single();

      if (error && error.code !== "PGRST116") throw error;

      const published = data ? data.published : false;
      const publishedAt = data ? data.published_at : null;

      return NextResponse.json({
        published,
        published_at: publishedAt,
      });
    }

    // Return all publishing statuses
    const { data, error } = await supabase
      .from("news_publishing")
      .select("*")
      .order("date", { ascending: false });

    if (error) throw error;

    const resultData = data || [];
    return NextResponse.json({ data: resultData });
  } catch (err) {
    console.error("Error fetching publishing status:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch" },
      { status: 500 }
    );
  }
}
