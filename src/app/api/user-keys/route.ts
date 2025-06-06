import { getSupabaseClient } from "@/lib/supabase";
import { NextResponse, NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import bcrypt from "bcrypt";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    console.log("User-keys GET User ID:", userId);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const supabase = await getSupabaseClient(req);
    const { data, error } = await supabase
      .from("user_keys")
      .select("key_hash")
      .eq("user_id", userId)
      .single();
    if (error && error.code !== "PGRST116") {
      console.error("Select error:", error);
      return NextResponse.json(
        { error: "Query failed", details: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json({
      keyExists: !!data,
      key_hash: data?.key_hash || null,
    });
  } catch (error) {
    console.error("User-keys GET error:", error);
    return NextResponse.json(
      { error: "Server error", details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    console.log("User-keys POST User ID:", userId);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { userKey, verifyOnly } = await req.json();
    console.log("User key provided:", !!userKey, "Verify only:", verifyOnly);
    if (!userKey) {
      return NextResponse.json({ error: "User key required" }, { status: 400 });
    }
    const supabase = await getSupabaseClient(req);
    const { data: existingKey, error: selectError } = await supabase
      .from("user_keys")
      .select("key_hash")
      .eq("user_id", userId)
      .single();
    if (selectError && selectError.code !== "PGRST116") {
      console.error("Select error:", selectError);
      return NextResponse.json(
        { error: "Query failed", details: selectError.message },
        { status: 500 }
      );
    }
    if (verifyOnly && existingKey) {
      const isValid = await bcrypt.compare(userKey, existingKey.key_hash);
      if (!isValid) {
        return NextResponse.json({ error: "Invalid key" }, { status: 400 });
      }
      return NextResponse.json({ success: true, keyValid: true });
    }
    if (existingKey && !verifyOnly) {
      return NextResponse.json({ error: "Key already set" }, { status: 400 });
    }
    if (!existingKey && !verifyOnly) {
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
      return NextResponse.json({ success: true, keyValid: true });
    }
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  } catch (error) {
    console.error("User-keys POST error:", error);
    return NextResponse.json(
      { error: "Server error", details: (error as Error).message },
      { status: 500 }
    );
  }
}
