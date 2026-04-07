import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedSupabase } from "@/lib/auth-api";

export async function GET(req: NextRequest) {
  const auth = await getAuthenticatedSupabase();
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(req.url);
  const customerId = searchParams.get("customerId");

  if (!customerId) {
    return NextResponse.json({ error: "Customer ID is required" }, { status: 400 });
  }

  const { data: entries, error: entriesError } = await auth.supabase
    .from("entries")
    .select("total_amount")
    .eq("customer_id", customerId);

  if (entriesError) {
    return NextResponse.json({ error: entriesError.message }, { status: 500 });
  }

  const { data: transactions, error: txError } = await auth.supabase
    .from("transactions")
    .select("amount")
    .eq("customer_id", customerId);

  if (txError) {
    return NextResponse.json({ error: txError.message }, { status: 500 });
  }

  const totalSales = (entries || []).reduce(
    (sum, row) => sum + Number(row.total_amount || 0),
    0
  );
  const totalPayments = (transactions || []).reduce(
    (sum, row) => sum + Number(row.amount || 0),
    0
  );

  return NextResponse.json({
    totalSales,
    totalPayments,
    balance: totalSales - totalPayments,
  });
}
