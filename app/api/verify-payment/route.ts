import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      plan 
    } = await req.json();

    // 1. Verify Signature
    const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generated_signature = hmac.digest("hex");

    if (generated_signature !== razorpay_signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // 2. ACID Transaction via Database RPC
    const amount = plan === "plan1" ? 359 : 559;
    
    const { error: rpcError } = await supabase.rpc('handle_subscription_payment', {
      p_user_id: user.id,
      p_plan_name: plan,
      p_amount: amount,
      p_order_id: razorpay_order_id,
      p_payment_id: razorpay_payment_id
    });

    if (rpcError) {
      console.error("RPC Transaction Error:", rpcError);
      throw new Error("Transaction failed in database. Please contact support.");
    }

    // 3. WhatsApp Notification (Async - doesn't block the response)
    const { data: profileData } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", user.id)
      .single();
      
    const profile = profileData as any;

    if (profile?.phone) {
      try {
        const { sendWhatsAppMessage } = await import("@/lib/twilio");
        await sendWhatsAppMessage(
          profile.phone,
          `Hello ${profile.name}! ✅ Payment of ₹${amount} successful. Your ${plan} is now active for 30 days. Thank you!`
        );
      } catch (waErr) {
        console.error("WhatsApp failed but payment was already secured:", waErr);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Fatal Payment Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
