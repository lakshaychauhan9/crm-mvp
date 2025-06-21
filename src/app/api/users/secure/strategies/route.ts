import { getSupabaseClient } from "@/lib/supabase";
import { NextResponse, NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { encrypt } from "@/lib/crypto";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const supabase = await getSupabaseClient(req);
    const { data, error } = await supabase
      .from("strategies")
      .select("id, user_id, encrypted_data, salt, iv, created_at, updated_at")
      .eq("user_id", userId);
    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Query failed", details: error.message },
        { status: 500 }
      );
    }
    // Validate data
    const validData = data.filter(
      (strategy) =>
        strategy.id &&
        strategy.user_id &&
        strategy.encrypted_data &&
        strategy.salt &&
        strategy.iv
    );
    return NextResponse.json({ data: validData });
  } catch (error) {
    console.error("Strategies GET error:", error);
    return NextResponse.json(
      { error: "Server error", details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { title, steps, userKey } = await req.json();
    if (!title || !userKey) {
      return NextResponse.json(
        { error: "Title and user key required" },
        { status: 400 }
      );
    }
    const supabase = await getSupabaseClient(req);
    const { data: keyData, error: keyError } = await supabase
      .from("user_keys")
      .select("key_hash")
      .eq("user_id", userId)
      .single();
    if (keyError || !keyData) {
      return NextResponse.json({ error: "Invalid user key" }, { status: 400 });
    }
    const isValidKey = await bcrypt.compare(userKey, keyData.key_hash);
    if (!isValidKey) {
      return NextResponse.json({ error: "Invalid user key" }, { status: 400 });
    }
    const data = JSON.stringify({ title, steps: steps || [] });
    const { encryptedData: encrypted, salt, iv } = await encrypt(data, userKey);
    const { error: insertError } = await supabase.from("strategies").insert({
      id: uuidv4(),
      user_id: userId,
      encrypted_data: encrypted,
      salt,
      iv,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    if (insertError) {
      console.error("Supabase insert error:", insertError);
      return NextResponse.json(
        { error: "Insert failed", details: insertError.message },
        { status: 500 }
      );
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Strategies POST error:", error);
    return NextResponse.json(
      { error: "Server error", details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id, title, steps, userKey } = await req.json();
    if (!id || !title || !userKey) {
      return NextResponse.json(
        { error: "ID, title, and user key required" },
        { status: 400 }
      );
    }
    const supabase = await getSupabaseClient(req);
    const { data: keyData, error: keyError } = await supabase
      .from("user_keys")
      .select("key_hash")
      .eq("user_id", userId)
      .single();
    if (keyError || !keyData) {
      return NextResponse.json({ error: "Invalid user key" }, { status: 400 });
    }
    const isValidKey = await bcrypt.compare(userKey, keyData.key_hash);
    if (!isValidKey) {
      return NextResponse.json({ error: "Invalid user key" }, { status: 400 });
    }
    const data = JSON.stringify({ title, steps: steps || [] });
    const { encryptedData: encrypted, salt, iv } = await encrypt(data, userKey);
    const { error: updateError } = await supabase
      .from("strategies")
      .update({
        encrypted_data: encrypted,
        salt,
        iv,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", userId);
    if (updateError) {
      console.error("Supabase update error:", updateError);
      return NextResponse.json(
        { error: "Update failed", details: updateError.message },
        { status: 500 }
      );
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Strategies PUT error:", error);
    return NextResponse.json(
      { error: "Server error", details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await req.json();
    if (!id)
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    const supabase = await getSupabaseClient(req);
    const { error } = await supabase
      .from("strategies")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);
    if (error) {
      console.error("Supabase delete error:", error);
      return NextResponse.json(
        { error: "Delete failed", details: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Strategies DELETE error:", error);
    return NextResponse.json(
      { error: "Server error", details: (error as Error).message },
      { status: 500 }
    );
  }
}
