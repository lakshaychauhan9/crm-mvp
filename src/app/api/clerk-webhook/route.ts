import { supabase } from "@/lib/supabase";
import { Webhook } from "svix";
import { NextResponse } from "next/server";

type ClerkWebhookEvent = {
  type: string;
  data: {
    id: string;
    email_addresses: { email_address: string }[];
    username?: string;
  };
};

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  try {
    const payload = await req.text();
    const headers = Object.fromEntries(req.headers.entries());

    const wh = new Webhook(webhookSecret);
    const evt = wh.verify(payload, headers) as ClerkWebhookEvent;

    console.log("Webhook received:", evt);

    if (evt.type === "user.created") {
      const { id, email_addresses, username } = evt.data;
      const email = email_addresses[0]?.email_address;

      if (!email) {
        return NextResponse.json(
          { error: "No email provided" },
          { status: 400 }
        );
      }

      const { error } = await supabase.from("users").upsert(
        {
          user_id: id,
          email,
          username,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

      if (error) {
        console.error("Supabase upsert error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, message: "Unhandled event" });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json(
      { error: "Webhook verification failed", details: (err as Error).message },
      { status: 400 }
    );
  }
}
