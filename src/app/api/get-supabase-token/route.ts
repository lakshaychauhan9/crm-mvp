// src/app/api/get-supabase-token/route.ts
// Returns Clerk JWT token for Supabase client-side authentication.

import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export async function GET(request: NextRequest) {
  try {
    const auth = getAuth(request);
    const token = await auth.getToken({ template: "supabase" });
    console.log("get-supabase-token: Clerk token:", {
      token: token ? "present" : "missing",
    });

    if (!token) {
      console.error("get-supabase-token: No token available");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Decode JWT for debugging
    const decoded = jwt.decode(token);
    console.log("get-supabase-token: JWT claims:", decoded);

    return NextResponse.json({ token }, { status: 200 });
  } catch (err) {
    console.error("get-supabase-token: Error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
