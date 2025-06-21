// // src/app/api/users/set-encryption-key/route.ts
// import { getSupabaseAdminClient } from "@/lib/supabase";
// import { NextResponse, NextRequest } from "next/server";
// import { auth } from "@clerk/nextjs/server";

// export async function POST(req: NextRequest) {
//   try {
//     const { userId } = await auth();
//     if (!userId) {
//       console.error("No userId found in auth");
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     console.log("Attempting to set encryption key for user:", userId);

//     const { salt, iv, encryptedData } = await req.json();

//     if (!salt || !iv || !encryptedData) {
//       console.error("Missing encryption key metadata", {
//         salt,
//         iv,
//         encryptedData,
//       });
//       return NextResponse.json(
//         { error: "Missing encryption key metadata" },
//         { status: 400 }
//       );
//     }

//     const supabase = await getSupabaseAdminClient();

//     // Check if user exists and if key is already set
//     const { data: user, error: userError } = await supabase
//       .from("users")
//       .select(
//         "id, email, encryption_key_salt, encryption_test_iv, encrypted_test_data"
//       )
//       .eq("id", userId)
//       .maybeSingle();

//     console.log("User query result:", {
//       user: user
//         ? { id: user.id, email: user.email, hasKey: !!user.encryption_key_salt }
//         : null,
//       error: userError?.message,
//     });

//     if (userError || !user) {
//       console.error("User not found or error:", {
//         userId,
//         error: userError?.message || "No user",
//       });
//       return NextResponse.json({ error: "User not found" }, { status: 404 });
//     }

//     if (
//       user.encryption_key_salt ||
//       user.encryption_test_iv ||
//       user.encrypted_test_data
//     ) {
//       console.error("Encryption key already set for user:", userId);
//       return NextResponse.json(
//         { error: "Encryption key already set" },
//         { status: 400 }
//       );
//     }

//     // Set encryption metadata
//     const { error } = await supabase
//       .from("users")
//       .update({
//         encryption_key_salt: salt,
//         encryption_test_iv: iv,
//         encrypted_test_data: encryptedData,
//         updated_at: new Date().toISOString(),
//       })
//       .eq("id", userId);

//     if (error) {
//       console.error("Supabase update error for encryption key:", {
//         error: error.message,
//         code: error.code,
//         details: error.details,
//       });
//       return NextResponse.json({ error: error.message }, { status: 500 });
//     }

//     console.log(`Encryption key metadata set for user: ${userId}`);
//     return NextResponse.json({ success: true });
//   } catch (error) {
//     console.error("API /users/set-encryption-key error:", {
//       message: (error as Error).message,
//       stack: (error as Error).stack,
//     });
//     return NextResponse.json(
//       { error: (error as Error).message || "Server error" },
//       { status: 500 }
//     );
//   }
// }

// src/app/api/users/set-encryption-key/route.ts
// Sets encryption key metadata for the authenticated user.
import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import type { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    console.log("set-encryption-key: Clerk User ID:", userId);
    if (!userId) {
      console.error("set-encryption-key: No authenticated user found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { salt, iv, encryptedData } = await req.json();
    console.log("set-encryption-key: Request body:", {
      salt,
      iv,
      encryptedData,
    });

    if (!salt || !iv || !encryptedData) {
      console.error("set-encryption-key: Invalid request body");
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const supabase = await getSupabaseServerClient();
    const { error } = await supabase
      .from("users")
      .update({
        encryption_key_salt: salt,
        encryption_test_iv: iv,
        encrypted_test_data: encryptedData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) {
      console.error("set-encryption-key: Supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("set-encryption-key: Success:", { userId, salt });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("set-encryption-key: Error:", (err as Error).message);
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}
