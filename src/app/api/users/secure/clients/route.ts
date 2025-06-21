import { getSupabaseClient } from "@/lib/supabase";
import { NextResponse, NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";

// API route for client CRUD operations
// Validates userKey via bcrypt and supports legacy data (nullable salt)
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    console.log("Clients GET User ID:", userId);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userKey = req.headers.get("X-User-Key");
    if (!userKey) {
      return NextResponse.json({ error: "User key required" }, { status: 400 });
    }
    const supabase = await getSupabaseClient(req);
    // Verify userKey
    const { data: userKeyData, error: userKeyError } = await supabase
      .from("user_keys")
      .select("key_hash")
      .eq("user_id", userId)
      .single();
    if (userKeyError || !userKeyData) {
      console.error("User key query error:", userKeyError);
      return NextResponse.json(
        { error: "User key not found" },
        { status: 400 }
      );
    }
    if (!(await bcrypt.compare(userKey, userKeyData.key_hash))) {
      console.log("Invalid user key for user:", userId);
      return NextResponse.json({ error: "Invalid user key" }, { status: 400 });
    }
    // Fetch clients
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
    // Filter valid data (allow nullable salt for legacy)
    const validData = data.filter(
      (client) =>
        client.id && client.user_id && client.encrypted_data && client.iv
    );
    console.log("Fetched clients:", validData.length);
    return NextResponse.json({ data: validData });
  } catch (error) {
    console.error("Clients GET error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    console.log("Clients POST User ID:", userId);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { encrypted_data, salt, iv, userKey } = await req.json();
    if (!encrypted_data || !iv || !userKey) {
      console.log("POST missing fields:", {
        encrypted_data,
        salt,
        iv,
        userKey,
      });
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    const supabase = await getSupabaseClient(req);
    const { data: userKeyData, error: userKeyError } = await supabase
      .from("user_keys")
      .select("key_hash")
      .eq("user_id", userId)
      .single();
    if (userKeyError || !userKeyData) {
      console.error("User key query error:", userKeyError);
      return NextResponse.json(
        { error: "User key not found" },
        { status: 400 }
      );
    }
    if (!(await bcrypt.compare(userKey, userKeyData.key_hash))) {
      console.log("Invalid user key for user:", userId);
      return NextResponse.json({ error: "Invalid user key" }, { status: 400 });
    }
    const clientData = {
      id: uuidv4(),
      user_id: userId,
      encrypted_data,
      salt: salt || "", // Support legacy data
      iv,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    console.log("Inserting client:", { id: clientData.id, user_id: userId });
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
    console.log("Inserted client ID:", insertedData.id);
    return NextResponse.json({ success: true, id: insertedData.id });
  } catch (error) {
    console.error("Clients POST error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { userId } = await auth();
    console.log("Clients PUT User ID:", userId);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id, encrypted_data, salt, iv, userKey } = await req.json();
    if (!id || !encrypted_data || !iv || !userKey) {
      console.log("PUT missing fields:", {
        id,
        encrypted_data,
        salt,
        iv,
        userKey,
      });
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    const supabase = await getSupabaseClient(req);
    const { data: userKeyData, error: userKeyError } = await supabase
      .from("user_keys")
      .select("key_hash")
      .eq("user_id", userId)
      .single();
    if (userKeyError || !userKeyData) {
      console.error("User key query error:", userKeyError);
      return NextResponse.json(
        { error: "User key not found" },
        { status: 400 }
      );
    }
    if (!(await bcrypt.compare(userKey, userKeyData.key_hash))) {
      console.log("Invalid user key for user:", userId);
      return NextResponse.json({ error: "Invalid user key" }, { status: 400 });
    }
    const updates = {
      encrypted_data,
      salt: salt || "", // Support legacy data
      iv,
      updated_at: new Date().toISOString(),
    };
    console.log("Updating client:", { id, user_id: userId });
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
    console.log("Updated client ID:", id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Clients PUT error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await auth();
    console.log("Clients DELETE User ID:", userId);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id, userKey } = await req.json();
    if (!id || !userKey) {
      console.log("DELETE missing fields:", { id, userKey });
      return NextResponse.json(
        { error: "ID and userKey required" },
        { status: 400 }
      );
    }
    const supabase = await getSupabaseClient(req);
    const { data: userKeyData, error: userKeyError } = await supabase
      .from("user_keys")
      .select("key_hash")
      .eq("user_id", userId)
      .single();
    if (userKeyError || !userKeyData) {
      console.error("User key query error:", userKeyError);
      return NextResponse.json(
        { error: "User key not found" },
        { status: 400 }
      );
    }
    if (!(await bcrypt.compare(userKey, userKeyData.key_hash))) {
      console.log("Invalid user key for user:", userId);
      return NextResponse.json({ error: "Invalid user key" }, { status: 400 });
    }
    console.log("Deleting client:", { id, user_id: userId });
    const { error } = await supabase
      .from("clients")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);
    if (error) {
      console.error("Supabase DELETE error:", error);
      return NextResponse.json(
        { error: "Delete failed", details: error.message },
        { status: 500 }
      );
    }
    console.log("Deleted client ID:", id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Clients DELETE error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
