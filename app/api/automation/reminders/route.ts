import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { sendWhatsAppMessage } from "@/lib/twilio";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 1. Find all users on Plan 2
  const { data: premiumUsers } = await supabase
    .from("user_profiles")
    .select("id")
    .eq("plan", "plan2");

  if (!premiumUsers) return NextResponse.json({ message: "No premium users" });

  const summary = [];

  for (const user of premiumUsers) {
    // 2. For each user, find customers with balance > 0
    // Note: This logic assumes balance calculation is cached or computed.
    // For now, we fetch customers and we'll need to compute their balance.
    const { data: customers } = await supabase
      .from("daily_customers")
      .select("id, name, phone")
      .eq("user_id", user.id);

    if (!customers) continue;

    for (const customer of customers) {
      if (!customer.phone) continue;

      // Compute balance (Total Sales - Total Paid)
      const { data: entries } = await supabase
        .from("daily_entries")
        .select("total_amount")
        .eq("customer_id", customer.id);
      
      const { data: txs } = await supabase
        .from("daily_transactions")
        .select("amount")
        .eq("customer_id", customer.id);

      const totalSales = entries?.reduce((sum, e) => sum + Number(e.total_amount), 0) || 0;
      const totalPaid = txs?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;
      const balance = totalSales - totalPaid;

      if (balance > 0) {
        const message = `[AUTO-REMINDER]\nHello ${customer.name},\n\nYour net payable balance at our dairy is *₹${balance.toFixed(2)}*. Please clear your dues at your earliest convenience.\n\nHave a great day!`;
        await sendWhatsAppMessage(customer.phone, message);
      }
    }
    summary.push({ userId: user.id, customerCount: customers.length });
  }

  return NextResponse.json({ summary });
}
