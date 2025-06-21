// import { createClient } from "@supabase/supabase-js";
// import { getAuth } from "@clerk/nextjs/server";
// import { NextRequest } from "next/server";
// import { IncomingMessage } from "http";
// import { toRequestLike } from "./clerk-utils";
// import jwt from "jsonwebtoken";

// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
// const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// // Authenticated client for user-specific operations (uses Clerk JWT)
// export async function getSupabaseClient(req?: NextRequest | IncomingMessage) {
//   if (!supabaseUrl || !supabaseAnonKey) {
//     console.error("Supabase configuration error:", {
//       supabaseUrl: !!supabaseUrl,
//       supabaseAnonKey: !!supabaseAnonKey,
//     });
//     throw new Error(
//       "Supabase configuration error: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is missing"
//     );
//   }

//   const client = createClient(supabaseUrl, supabaseAnonKey, {
//     db: { schema: "public" }, // Explicitly set schema
//   });

//   if (req) {
//     try {
//       const clerkRequest =
//         req instanceof NextRequest ? req : toRequestLike(req);
//       const authResult = getAuth(clerkRequest);
//       const token = await authResult.getToken({ template: "supabase" });

//       if (token) {
//         const decoded = jwt.decode(token) as { sub?: string };
//         console.log("Clerk JWT details:", {
//           tokenPresent: !!token,
//           userId: authResult.userId,
//           jwtSub: decoded?.sub,
//         });

//         return createClient(supabaseUrl, supabaseAnonKey, {
//           global: {
//             headers: {
//               Authorization: `Bearer ${token}`,
//             },
//           },
//           db: { schema: "public" },
//         });
//       }
//     } catch (error) {
//       console.error("Error getting Clerk token:", {
//         message: (error as Error).message,
//         stack: (error as Error).stack,
//       });
//     }
//   }
//   return client;
// }

// // Admin client for webhook operations (bypasses RLS)
// export async function getSupabaseAdminClient() {
//   if (!supabaseUrl || !supabaseServiceRoleKey) {
//     console.error("Supabase admin configuration error:", {
//       supabaseUrl: !!supabaseUrl,
//       supabaseServiceRoleKey: !!supabaseServiceRoleKey,
//     });
//     throw new Error(
//       "Supabase configuration error: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing"
//     );
//   }
//   return createClient(supabaseUrl, supabaseServiceRoleKey, {
//     db: { schema: "public" },
//   });
// }

// src/lib/supabase.ts
// Supabase client utilities for admin and user-authenticated operations.

import { createClient } from "@supabase/supabase-js";
import { auth } from "@clerk/nextjs/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Admin client for webhook operations (bypasses RLS)
export async function getSupabaseAdminClient() {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error("Missing Supabase admin configuration");
  }
  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    db: { schema: "public" },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

// Server-side client for authenticated API routes
export async function getSupabaseServerClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase configuration");
  }

  const { getToken } = await auth();
  const token = await getToken();
  console.log("supabase: Server-side Clerk token:", {
    token: token ? "present" : "missing",
  });

  return createClient(supabaseUrl, supabaseAnonKey, {
    db: { schema: "public" },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    },
  });
}

// Client-side client for React components
export function getSupabaseBrowserClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase configuration");
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    db: { schema: "public" },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
