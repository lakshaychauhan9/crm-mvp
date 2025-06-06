import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { data, error } = await supabase
      .from("clients")
      .select("id, user_id, encrypted_data, salt, iv, created_at, updated_at")
      .eq("user_id", userId);
    if (error) {
      console.error("Supabase GET error:", error);
      return NextResponse.json(
        { error: "Query failed", details: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json({ data });
  } catch (err) {
    console.error("Unexpected GET error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { encrypted_data, salt, iv, userKey } = await req.json();
    if (!encrypted_data || !salt || !iv || !userKey) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    // Verify user key
    const { data: userKeyData, error: userKeyError } = await supabase
      .from("user_keys")
      .select("key_hash")
      .eq("user_id", userId)
      .single();
    if (userKeyError || !userKeyData) {
      return NextResponse.json(
        { error: "User key not found" },
        { status: 400 }
      );
    }
    if (!(await bcrypt.compare(userKey, userKeyData.key_hash))) {
      return NextResponse.json({ error: "Invalid user key" }, { status: 400 });
    }
    const clientData = {
      id: uuidv4(),
      user_id: userId,
      encrypted_data,
      salt,
      iv,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    console.log("Inserting client:", clientData);
    const { error, data: insertedData } = await supabase
      .from("clients")
      .insert(clientData)
      .select("id")
      .single();
    if (error) {
      console.error("Supabase POST error:", error);
      return NextResponse.json(
        { error: "Insert failed", details: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json({ success: true, id: insertedData.id });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id, encrypted_data, salt, iv, userKey } = await req.json();
    if (!id || !encrypted_data || !salt || !iv || !userKey) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    // Verify user key
    const { data: userKeyData, error: userKeyError } = await supabase
      .from("user_keys")
      .select("key_hash")
      .eq("user_id", userId)
      .single();
    if (userKeyError || !userKeyData) {
      return NextResponse.json(
        { error: "User key not found" },
        { status: 400 }
      );
    }
    if (!(await bcrypt.compare(userKey, userKeyData.key_hash))) {
      return NextResponse.json({ error: "Invalid user key" }, { status: 400 });
    }
    const updates = {
      encrypted_data,
      salt,
      iv,
      updated_at: new Date().toISOString(),
    };
    console.log("Updating client:", { id, updates });
    const { error } = await supabase
      .from("clients")
      .update(updates)
      .eq("id", id)
      .eq("user_id", userId);
    if (error) {
      console.error("Supabase PUT error:", error);
      return NextResponse.json(
        { error: "Update failed", details: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
