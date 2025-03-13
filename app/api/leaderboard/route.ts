import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Load Supabase credentials
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("❌ Supabase credentials are missing. Check .env.local file!");
  throw new Error("Supabase credentials are missing!");
}

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function GET() {
  try {
    console.log("✅ Fetching leaderboard data...");

    // Fetch users sorted by totalAmount
    const { data, error } = await supabase
      .from("users") // Ensure this table exists
      .select("id, name, email, totalAmount, image") // Check if totalAmount column exists
      .order("totalAmount", { ascending: false });

    if (error) {
      console.error("❌ Supabase Error:", error.message);
      return NextResponse.json({ message: "Database error", error: error.message }, { status: 500 });
    }

    console.log("✅ Leaderboard data fetched successfully:", data);
    return NextResponse.json(data, { status: 200 });

  } catch (error: any) {
    console.error("❌ API Error:", error.message);
    return NextResponse.json({ message: "Failed to fetch leaderboard", error: error.message }, { status: 500 });
  }
}
