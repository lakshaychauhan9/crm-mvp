import { getSupabaseClient } from "@/lib/supabase";
import { NextResponse, NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    console.log("Users GET User ID:", userId);
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
      console.error("Supabase GET error:", error);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json({ data });
  } catch (error) {
    console.error("Users GET error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { userId } = await auth();
    console.log("Users PUT User ID:", userId);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { username } = await req.json();
    if (!username) {
      return NextResponse.json({ error: "Username required" }, { status: 400 });
    }
    const supabase = await getSupabaseClient(req);
    const { error } = await supabase
      .from("users")
      .update({ username, updated_at: new Date().toISOString() })
      .eq("user_id", userId);
    if (error) {
      console.error("Supabase PUT error:", error);
      return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Users PUT error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
