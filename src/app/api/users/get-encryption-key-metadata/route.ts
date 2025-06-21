// src/app/api/users/get-encryption-key-metadata/route.ts
// Fetches encryption key metadata for the authenticated user.

import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";
import type { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    console.log("get-encryption-key-metadata: Clerk User ID:", { userId });

    if (!userId) {
      console.error(
        "get-encryption-key-metadata: No authenticated user found."
      );
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await getSupabaseClient(request);
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("encryption_key_salt, encryption_test_iv, encrypted_test_data")
      .eq("id", userId)
      .maybeSingle();

    if (userError) {
      console.error(
        "get-encryption-key-metadata: Supabase query error:",
        userError
      );
      return NextResponse.json({ error: userError.message }, { status: 500 });
    }

    if (!userData) {
      console.log("get-encryption-key-metadata: No user found for ID:", userId);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const metadata = {
      encryption_key_salt: userData.encryption_key_salt ?? null,
      encryption_test_iv: userData.encryption_test_iv ?? null,
      encrypted_test_data: userData.encrypted_test_data ?? null,
    };

    console.log("get-encryption-key-metadata: Metadata fetched:", {
      userId,
      metadata,
    });

    return NextResponse.json(metadata, { status: 200 });
  } catch (err) {
    console.error("get-encryption-key-metadata: Error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
