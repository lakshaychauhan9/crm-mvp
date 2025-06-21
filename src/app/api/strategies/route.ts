// import { getSupabaseClient } from "@/lib/supabase";
// import { NextResponse, NextRequest } from "next/server";
// import { auth } from "@clerk/nextjs/server";
// import { encrypt } from "@/lib/crypto";
// import { v4 as uuidv4 } from "uuid";
// import bcrypt from "bcrypt";

// export async function GET(req: NextRequest) {
//   try {
//     const { userId } = await auth();
//     if (!userId)
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     const supabase = await getSupabaseClient(req);
//     const { data, error } = await supabase
//       .from("strategies")
//       .select("*")
//       .eq("user_id", userId);
//     if (error) {
//       console.error("Supabase error:", error);
//       return NextResponse.json(
//         { error: "Query failed", details: error.message },
//         { status: 500 }
//       );
//     }
//     return NextResponse.json({ data });
//   } catch (error) {
//     console.error("Strategies GET error:", error);
//     return NextResponse.json(
//       { error: "Server error", details: (error as Error).message },
//       { status: 500 }
//     );
//   }
// }

// export async function POST(req: NextRequest) {
//   try {
//     const { userId } = await auth();
//     if (!userId) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }
//     const { title, steps, userKey } = await req.json();
//     if (!title || !userKey) {
//       return NextResponse.json(
//         { error: "Title and user key required" },
//         { status: 400 }
//       );
//     }
//     const supabase = await getSupabaseClient(req);
//     const { data: keyData, error: keyError } = await supabase
//       .from("user_keys")
//       .select("key_hash")
//       .eq("user_id", userId)
//       .single();
//     if (keyError || !keyData) {
//       return NextResponse.json({ error: "Invalid user key" }, { status: 400 });
//     }
//     const isValidKey = await bcrypt.compare(userKey, keyData.key_hash);
//     if (!isValidKey) {
//       return NextResponse.json({ error: "Invalid user key" }, { status: 400 });
//     }
//     const data = JSON.stringify({ title, steps: steps || [] });
//     const { encrypted, salt, iv } = await encrypt(data, userKey);
//     const { error: insertError } = await supabase.from("strategies").insert({
//       id: uuidv4(),
//       user_id: userId,
//       encrypted_data: encrypted,
//       salt,
//       iv,
//       created_at: new Date().toISOString(),
//       updated_at: new Date().toISOString(),
//     });
//     if (insertError) {
//       console.error("Supabase insert error:", insertError);
//       return NextResponse.json(
//         { error: "Insert failed", details: insertError.message },
//         { status: 500 }
//       );
//     }
//     return NextResponse.json({ success: true });
//   } catch (error) {
//     console.error("Strategies POST error:", error);
//     return NextResponse.json(
//       { error: "Server error", details: (error as Error).message },
//       { status: 500 }
//     );
//   }
// }

// export async function PUT(req: NextRequest) {
//   try {
//     const { userId } = await auth();
//     if (!userId)
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     const { id, title, steps, userKey } = await req.json();
//     if (!id || !title || !userKey) {
//       return NextResponse.json(
//         { error: "ID, title, and user key required" },
//         { status: 400 }
//       );
//     }
//     const supabase = await getSupabaseClient(req);
//     const { data: keyData, error: keyError } = await supabase
//       .from("user_keys")
//       .select("key_hash")
//       .eq("user_id", userId)
//       .single();
//     if (keyError || !keyData) {
//       return NextResponse.json({ error: "Invalid user key" }, { status: 400 });
//     }
//     const isValidKey = await bcrypt.compare(userKey, keyData.key_hash);
//     if (!isValidKey) {
//       return NextResponse.json({ error: "Invalid user key" }, { status: 400 });
//     }
//     const data = JSON.stringify({ title, steps: steps || [] });
//     const { encrypted, salt, iv } = await encrypt(data, userKey);
//     const { error: updateError } = await supabase
//       .from("strategies")
//       .update({
//         encrypted_data: encrypted,
//         salt,
//         iv,
//         updated_at: new Date().toISOString(),
//       })
//       .eq("id", id)
//       .eq("user_id", userId);
//     if (updateError) {
//       console.error("Supabase update error:", updateError);
//       return NextResponse.json(
//         { error: "Update failed", details: updateError.message },
//         { status: 500 }
//       );
//     }
//     return NextResponse.json({ success: true });
//   } catch (error) {
//     console.error("Strategies PUT error:", error);
//     return NextResponse.json(
//       { error: "Server error", details: (error as Error).message },
//       { status: 500 }
//     );
//   }
// }

// export async function DELETE(req: NextRequest) {
//   try {
//     const { userId } = await auth();
//     if (!userId)
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     const { id } = await req.json();
//     if (!id)
//       return NextResponse.json({ error: "ID required" }, { status: 400 });
//     const supabase = await getSupabaseClient(req);
//     const { error } = await supabase
//       .from("strategies")
//       .delete()
//       .eq("id", id)
//       .eq("user_id", userId);
//     if (error) {
//       console.error("Supabase delete error:", error);
//       return NextResponse.json(
//         { error: "Delete failed", details: error.message },
//         { status: 500 }
//       );
//     }
//     return NextResponse.json({ success: true });
//   } catch (error) {
//     console.error("Strategies DELETE error:", error);
//     return NextResponse.json(
//       { error: "Server error", details: (error as Error).message },
//       { status: 500 }
//     );
//   }
// }

/**
 * API route for strategies in Client Tracker (Server Component).
 * Handles GET, POST, PUT, DELETE requests for strategy CRUD operations.
 * Why: Manages encrypted strategy data with AES-256-CBC.
 * How: Uses Clerk for auth, Supabase for storage.
 * Changes:
 * - Created to match pitch-decks/route.ts and api/clients/route.ts.
 * - Validates userKey with bcrypt against user_keys.
 * - Returns raw data for decryption in store.ts.
 */
import { NextResponse, NextRequest } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";
import { auth } from "@clerk/nextjs/server";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    console.log("Strategies GET User ID:", userId);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const supabase = await getSupabaseClient(req);
    const { data, error } = await supabase
      .from("strategies")
      .select("id, user_id, encrypted_data, salt, iv, created_at, updated_at")
      .eq("user_id", userId);
    if (error) {
      console.error("Supabase GET error:", error);
      return NextResponse.json(
        { error: "Query failed", details: error.message },
        { status: 500 }
      );
    }
    const validData = data.filter((strategy) => {
      if (!strategy.encrypted_data || !strategy.iv || !strategy.salt) {
        console.error("Invalid strategy data:", strategy.id, {
          hasEncryptedData: !!strategy.encrypted_data,
          hasIv: !!strategy.iv,
          hasSalt: !!strategy.salt,
        });
        return false;
      }
      return true;
    });
    console.log("Fetched strategies:", validData.length);
    return NextResponse.json({ data: validData });
  } catch (error) {
    console.error("Strategies GET error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    console.log("Strategies POST User ID:", userId);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { encrypted_data, salt, iv, userKey } = await req.json();
    if (!encrypted_data || !salt || !iv || !userKey) {
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
    const strategyData = {
      id: uuidv4(),
      user_id: userId,
      encrypted_data,
      salt,
      iv,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    console.log("Inserting strategy:", {
      id: strategyData.id,
      user_id: userId,
    });
    const { error, data: insertedData } = await supabase
      .from("strategies")
      .insert(strategyData)
      .select("id")
      .single();
    if (error) {
      console.error("Supabase POST error:", error);
      return NextResponse.json(
        { error: "Insert failed", details: error.message },
        { status: 500 }
      );
    }
    console.log("Inserted strategy ID:", insertedData.id);
    return NextResponse.json({ success: true, id: insertedData.id });
  } catch (error) {
    console.error("Strategies POST error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { userId } = await auth();
    console.log("Strategies PUT User ID:", userId);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id, encrypted_data, salt, iv, userKey } = await req.json();
    if (!id || !encrypted_data || !salt || !iv || !userKey) {
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
      salt,
      iv,
      updated_at: new Date().toISOString(),
    };
    console.log("Updating strategy:", { id, user_id: userId });
    const { error } = await supabase
      .from("strategies")
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
    console.log("Updated strategy ID:", id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Strategies PUT error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await auth();
    console.log("Strategies DELETE User ID:", userId);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await req.json();
    if (!id) {
      console.log("DELETE missing ID");
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    }
    const supabase = await getSupabaseClient(req);
    console.log("Deleting strategy:", { id, user_id: userId });
    const { error } = await supabase
      .from("strategies")
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
    console.log("Deleted strategy ID:", id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Strategies DELETE error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
