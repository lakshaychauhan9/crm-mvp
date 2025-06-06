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
      .from("pitch_decks")
      .select("*")
      .eq("user_id", userId);
    if (error) {
      console.error("Supabase GET error:", error);
      return NextResponse.json(
        { error: "Query failed", details: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json({ data });
  } catch (error) {
    console.error("Pitch-decks GET error:", error);
    return NextResponse.json(
      { error: "Server error", details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { name, file, notes, userKey } = await req.json();
    if (!name || !userKey) {
      return NextResponse.json(
        { error: "Name and user key required" },
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
    let fileName: string | undefined;
    if (file) {
      const fileExt = file.name.split(".").pop();
      fileName = `${uuidv4()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from("pitch_decks")
        .upload(
          `private/${userId}/${fileName}`,
          Buffer.from(file.data, "base64")
        );
      if (uploadError) {
        console.error("Supabase upload error:", uploadError);
        return NextResponse.json(
          { error: "File upload failed", details: uploadError.message },
          { status: 500 }
        );
      }
    }
    const data = JSON.stringify({ name, file_path: fileName, notes });
    const { encrypted, salt, iv } = await encrypt(data, userKey);
    const { error: insertError } = await supabase.from("pitch_decks").insert({
      id: uuidv4(),
      user_id: userId,
      encrypted_data: encrypted,
      salt,
      iv,
      created_at: new Date().toISOString(),
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
    console.error("Pitch-decks POST error:", error);
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
    const { id, name, file, notes, userKey } = await req.json();
    if (!id || !name || !userKey) {
      return NextResponse.json(
        { error: "ID, name, and user key required" },
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
    let fileName: string | undefined;
    if (file) {
      const fileExt = file.name.split(".").pop();
      fileName = `${uuidv4()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from("pitch_decks")
        .upload(
          `private/${userId}/${fileName}`,
          Buffer.from(file.data, "base64")
        );
      if (uploadError) {
        console.error("Supabase upload error:", uploadError);
        return NextResponse.json(
          { error: "File upload failed", details: uploadError.message },
          { status: 500 }
        );
      }
    }
    const data = JSON.stringify({ name, file_path: fileName, notes });
    const { encrypted, salt, iv } = await encrypt(data, userKey);
    const { error: updateError } = await supabase
      .from("pitch_decks")
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
    console.error("Pitch-decks PUT error:", error);
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
      .from("pitch_decks")
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
    console.error("Pitch-decks DELETE error:", error);
    return NextResponse.json(
      { error: "Server error", details: (error as Error).message },
      { status: 500 }
    );
  }
}
