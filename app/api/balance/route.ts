import { NextRequest } from "next/server";
import { getAuthenticatedSupabase } from "@/lib/auth-api";
import { json } from "@/lib/http";

export async function GET(req: NextRequest) {
  const auth = await getAuthenticatedSupabase();
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(req.url);
  const customerId = searchParams.get("customerId");

  if (!customerId) {
    return json({ error: "Customer ID is required" }, { status: 400 });
  }

  const { data: entries, error: entriesError } = await auth.supabase
    .from("dairy_entries" as any)
    .select("total_amount")
    .eq("customer_id", customerId) as { data: any[] | null; error: any };

  if (entriesError) {
    return json({ error: entriesError.message }, { status: 500 });
  }

  const { data: transactions, error: txError } = await auth.supabase
    .from("dairy_transactions" as any)
    .select("amount")
    .eq("customer_id", customerId) as { data: any[] | null; error: any };

  if (txError) {
    return json({ error: txError.message }, { status: 500 });
  }

  const totalSales = (entries || []).reduce(
    (sum, row) => sum + Number(row.total_amount || 0),
    0
  );
  const totalPayments = (transactions || []).reduce(
    (sum, row) => sum + Number(row.amount || 0),
    0
  );

  return json({
    totalSales,
    totalPayments,
    balance: totalSales - totalPayments,
  });
}
