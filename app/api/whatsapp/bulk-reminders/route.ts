export const dynamic = "force-dynamic";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { sendWhatsAppMessage } from "@/lib/twilio";

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if user is on Plan 2
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("plan")
    .eq("id", user.id)
    .single() as { data: any | null };

  if (profile?.plan !== "plan2") {
    return NextResponse.json({ error: "Bulk reminders require Premium Plan" }, { status: 403 });
  }

  const { customers } = await req.json(); // Array of { id, name, phone, balance }

  const results = [];
  for (const customer of customers) {
    if (!customer.phone || customer.balance <= 0) continue;

    const message = `Hello ${customer.name},\n\nYour dairy payment of *₹${customer.balance.toFixed(2)}* is overdue. Please settle it soon.\n\nThank you!`;
    const res = await sendWhatsAppMessage(customer.phone, message);
    
    results.push({
      customerId: customer.id,
      success: res.success,
      error: res.error,
    });

    // To prevent Twilio rate limiting on trial accounts, add a small delay
    await new Promise(r => setTimeout(r, 500));
  }

  return NextResponse.json({ results });
}
