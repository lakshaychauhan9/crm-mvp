// src/app/api/users/route.ts
// API route to fetch user data from Supabase.
// Secured with Clerk authentication and Supabase RLS.
import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  try {
    const { userId } = await auth();
    console.log("Users GET User ID:", userId);
    if (!userId) {
      console.error("Users GET: No authenticated user found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await getSupabaseServerClient();
    const { data, error } = await supabase
      .from("users")
      .select(
        "id, email, username, user_metadata, encryption_key_salt, encryption_test_iv, encrypted_test_data"
      )
      .eq("id", userId)
      .single();

    if (error || !data) {
      console.error("Users GET: Supabase error:", error);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    console.log("Users GET: Success:", data);
    return NextResponse.json({ data }, { status: 200 });
  } catch (err) {
    console.error("Users GET: Error:", (err as Error).message);
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}
