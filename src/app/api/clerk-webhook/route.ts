import { Webhook } from "svix";
import { getSupabaseAdminClient } from "@/lib/supabase-server";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const headers = Object.fromEntries(req.headers.entries());
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET!;

    const svix = new Webhook(webhookSecret);
    const payload = svix.verify(body, headers) as any;
    console.log("Webhook received:", {
      type: payload.type,
      user_id: payload.data?.id,
      email: payload.data?.email_addresses?.[0]?.email_address,
    });

    if (payload.type !== "user.created" && payload.type !== "user.updated") {
      return NextResponse.json({ success: true }, { status: 200 });
    }

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

    const { error } = await supabase
      .from("users")
      .upsert(userData, { onConflict: "id" });
    if (error) {
      console.error("Webhook: Upsert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("Webhook: User synced:", {
      id: userData.id,
      email: userData.email,
      username: userData.username,
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("Webhook: Error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// API route to handle Clerk webhooks for user synchronization.
// Upserts user data into Supabase's public.users table.
// import { Webhook } from "svix";
// import { headers } from "next/headers";
// import { getSupabaseAdminClient } from "@/lib/supabase-server";

// export async function POST(req: Request) {
//   const body = await req.text();
//   const headerList = headers();
//   const webhookSecret = process.env.CLERK_WEBHOOK_SECRET!;

//   if (!webhookSecret) {
//     return new Response("Missing webhook secret", { status: 500 });
//   }

//   try {
//     const svix = new Webhook(webhookSecret);
//     const payload = svix.verify(body, {
//       "svix-id": headerList.get("svix-id")!,
//       "svix-timestamp": headerList.get("svix-timestamp")!,
//       "svix-signature": headerList.get("svix-signature")!,
//     }) as any;

//     if (process.env.NODE_ENV === "development") {
//       console.log("Webhook received:", {
//         type: payload.type,
//         userId: payload.data?.id,
//       });
//     }

//     if (payload.type === "user.created") {
//       const user = payload.data;
//       const supabase = getSupabaseAdminClient();

//       const { error } = await supabase.from("users").upsert({
//         id: user.id,
//         email: user.email_addresses[0]?.email_address,
//         username: user.username || null,
//         user_metadata: {
//           first_name: user.first_name,
//           last_name: user.last_name,
//           username: user.username,
//           image_url: user.image_url,
//         },
//         created_at: new Date().toISOString(),
//         updated_at: new Date().toISOString(),
//       });

//       if (error) {
//         console.error("Webhook: Supabase error:", error);
//         return new Response("Failed to sync user", { status: 500 });
//       }

//       if (process.env.NODE_ENV === "development") {
//         console.log("Webhook: User synced:", {
//           id: user.id,
//           email: user.email_addresses[0]?.email_address,
//         });
//       }

//       return new Response("User synced", { status: 200 });
//     }

//     return new Response("Event ignored", { status: 200 });
//   } catch (err) {
//     console.error("Webhook error:", err);
//     return new Response("Invalid webhook signature", { status: 400 });
//   }
// }
