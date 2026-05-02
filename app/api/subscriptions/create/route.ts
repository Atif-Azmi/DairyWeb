export const dynamic = "force-dynamic";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import Razorpay from "razorpay";

export async function POST(req: Request) {
  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  });
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { planId } = await req.json();

  // Define plan IDs from your Razorpay dashboard
  const PLANS: Record<string, string> = {
    plan1: process.env.RAZORPAY_PLAN_1_ID!, // ₹459/month
    plan2: process.env.RAZORPAY_PLAN_2_ID!, // ₹569/month
  };

  const razorpayPlanId = PLANS[planId];

  if (!razorpayPlanId) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  try {
    const subscription = await razorpay.subscriptions.create({
      plan_id: razorpayPlanId,
      customer_notify: 1,
      total_count: 12, // 1 year
      addons: [],
      notes: {
        userId: user.id,
      },
    });

    return NextResponse.json({ subscriptionId: subscription.id });
  } catch (error: any) {
    console.error("Razorpay Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
