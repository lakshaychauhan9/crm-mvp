import { getSupabaseClient } from "@/lib/supabase";
import { NextResponse, NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    console.log("Test Supabase User ID:", userId);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const supabase = await getSupabaseClient(req);
    const { data, error } = await supabase
      .from("users")
      .select("user_id, email, username")
      .eq("user_id", userId)
      .single();
    if (error || !data) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json({ data });
  } catch (error) {
    console.error("Test Supabase error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: (error as Error).message },
      { status: 500 }
    );
  }
}
