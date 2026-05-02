import { createClient } from "@supabase/supabase-js";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import crypto from "crypto";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get("x-razorpay-signature");
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET!;

  // Verify signature
  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(body)
    .digest("hex");

  if (signature !== expectedSignature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(body);

  switch (event.event) {
    case "subscription.activated":
    case "subscription.charged": {
      const subscription = event.payload.subscription.entity;
      const payment = event.payload.payment?.entity;
      const userId = subscription.notes.userId;

      // Update user plan
      const planType = subscription.plan_id === process.env.RAZORPAY_PLAN_2_ID ? "plan2" : "plan1";

      await supabase
        .from("user_profiles")
        .update({
          plan: planType,
          subscription_id: subscription.id,
          subscription_status: "active",
        })
        .eq("id", userId);

      // Record payment
      if (payment) {
        await supabase.from("payments").insert({
          user_id: userId,
          razorpay_payment_id: payment.id,
          razorpay_order_id: payment.order_id,
          amount: payment.amount / 100,
          status: "success",
        });
      }
      break;
    }
    case "subscription.cancelled":
    case "subscription.expired": {
      const subscription = event.payload.subscription.entity;
      const userId = subscription.notes.userId;

      await supabase
        .from("user_profiles")
        .update({
          plan: "free",
          subscription_status: "expired",
        })
        .eq("id", userId);
      break;
    }
  }

  return NextResponse.json({ received: true });
}
