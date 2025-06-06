import { createClient } from "@supabase/supabase-js";
import { getAuth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function getSupabaseClient(req?: NextRequest) {
  const client = createClient(supabaseUrl, supabaseAnonKey);
  if (req) {
    try {
      const { getToken } = getAuth(req);
      const token = await getToken({ template: "supabase" });
      console.log("Clerk JWT token:", token ? "Present" : "Missing");
      if (token) {
        return createClient(supabaseUrl, supabaseAnonKey, {
          global: {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        });
      }
    } catch (error) {
      console.error("Error getting Clerk token:", error);
    }
  }
  return client;
}
