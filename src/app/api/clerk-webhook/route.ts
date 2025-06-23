// API route to handle Clerk webhooks for user synchronization.
// Upserts user data into Supabase's public.users table on user.created or user.updated events.
import { Webhook } from "svix";
import { getSupabaseAdminClient } from "@/lib/supabase-server";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

interface ClerkWebhookPayload {
  type: string;
  data: {
    id: string;
    email_addresses: { email_address: string }[];
    username?: string;
    first_name?: string;
    last_name?: string;
    image_url?: string;
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const headers = Object.fromEntries(req.headers.entries());
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET!;

    // Verify webhook signature using Svix.
    const svix = new Webhook(webhookSecret);
    const payload = svix.verify(body, headers) as ClerkWebhookPayload;
    if (process.env.NODE_ENV === "development") {
      console.log("Webhook received:", payload.data); // Log full Clerk payload.
    }

    // Handle only user.created and user.updated events.
    if (payload.type !== "user.created" && payload.type !== "user.updated") {
      return NextResponse.json({ success: true }, { status: 200 });
    }

    // Prepare user data for Supabase upsert.
    const supabase = await getSupabaseAdminClient();
    const userData = {
      id: payload.data.id,
      email: payload.data.email_addresses?.[0]?.email_address,
      username: payload.data.username || null,
      user_metadata: {
        first_name: payload.data.first_name || null,
        last_name: payload.data.last_name || null,
        username: payload.data.username || null,
        image_url: payload.data.image_url || null,
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Upsert user data into public.users table.
    const { error } = await supabase
      .from("users")
      .upsert(userData, { onConflict: "id" });
    if (error) {
      console.error("Webhook: Upsert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (process.env.NODE_ENV === "development") {
      console.log("Webhook: User synced:", {
        id: userData.id,
        email: userData.email,
        username: userData.username,
      });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("Webhook: Error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
