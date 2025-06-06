import { getSupabaseClient } from "@/lib/supabase";
import { NextResponse, NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import bcrypt from "bcrypt";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    console.log("User-keys User ID:", userId);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { userKey } = await req.json();
    console.log("User key provided:", !!userKey);
    if (!userKey) {
      return NextResponse.json({ error: "User key required" }, { status: 400 });
    }
    const supabase = await getSupabaseClient(req);
    const { data: existingKey, error: selectError } = await supabase
      .from("user_keys")
      .select("user_id")
      .eq("user_id", userId)
      .single();
    if (selectError && selectError.code !== "PGRST116") {
      console.error("Select error:", selectError);
      return NextResponse.json(
        { error: "Query failed", details: selectError.message },
        { status: 500 }
      );
    }
    if (existingKey) {
      return NextResponse.json({ error: "Key already set" }, { status: 400 });
    }
    const keyHash = await bcrypt.hash(userKey, 10);
    console.log("Inserting key hash for user:", userId);
    const { error: insertError } = await supabase.from("user_keys").insert({
      user_id: userId,
      key_hash: keyHash,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    if (insertError) {
      console.error("Supabase insert error:", insertError);
      return NextResponse.json(
        { error: "Key creation failed", details: insertError.message },
        { status: 500 }
      );
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("User-keys error:", error);
    return NextResponse.json(
      { error: "Server error", details: (error as Error).message },
      { status: 500 }
    );
  }
}
