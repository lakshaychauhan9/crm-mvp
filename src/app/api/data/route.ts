// src/app/api/data/route.ts

/**
 * API route to fetch all user data (clients, pitch decks, strategies).
 * Why: Reduces API calls for efficient data retrieval.
 * How: Queries multiple Supabase tables, returns combined data.
 */
import { getSupabaseClient } from "@/lib/supabase";
import { NextResponse, NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const supabase = await getSupabaseClient(req);
    // Fetch all tables in parallel
    const [clientsRes, pitchDecksRes, strategiesRes] = await Promise.all([
      supabase
        .from("clients")
        .select("id, user_id, encrypted_data, salt, iv, created_at, updated_at")
        .eq("user_id", userId),
      supabase
        .from("pitch_decks")
        .select("id, user_id, encrypted_data, salt, iv, created_at, updated_at")
        .eq("user_id", userId),
      supabase
        .from("strategies")
        .select("id, user_id, encrypted_data, salt, iv, created_at, updated_at")
        .eq("user_id", userId),
    ]);
    // Handle errors
    if (clientsRes.error || pitchDecksRes.error || strategiesRes.error) {
      console.error("Supabase errors:", {
        clients: clientsRes.error,
        pitchDecks: pitchDecksRes.error,
        strategies: strategiesRes.error,
      });
      return NextResponse.json({ error: "Query failed" }, { status: 500 });
    }
    // Filter invalid data
    const validClients = clientsRes.data.filter(
      (c) => c.encrypted_data && c.iv && c.salt
    );
    const validPitchDecks = pitchDecksRes.data.filter(
      (p) => p.encrypted_data && p.iv && p.salt
    );
    const validStrategies = strategiesRes.data.filter(
      (s) => s.encrypted_data && s.iv && s.salt
    );
    console.log("Fetched data:", {
      clients: validClients.length,
      pitchDecks: validPitchDecks.length,
      strategies: validStrategies.length,
    });
    return NextResponse.json({
      data: {
        clients: validClients,
        pitchDecks: validPitchDecks,
        strategies: validStrategies,
      },
    });
  } catch (error) {
    console.error("Data GET error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
