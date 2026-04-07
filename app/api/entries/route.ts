import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedSupabase } from "@/lib/auth-api";

export async function GET(req: NextRequest) {
  const auth = await getAuthenticatedSupabase();
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(req.url);
  const customerId = searchParams.get("customer_id");

  let query = auth.supabase.from("entries").select("*").order("date", { ascending: true });
  if (customerId) query = query.eq("customer_id", customerId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const auth = await getAuthenticatedSupabase();
  if (!auth.ok) return auth.response;

  const { customer_id, product_id, date, shift, quantity, price_per_unit } =
    await req.json();

  if (
    !customer_id ||
    !product_id ||
    !date ||
    !shift ||
    quantity == null ||
    price_per_unit == null
  ) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const { data, error } = await auth.supabase
    .from("entries")
    .insert([
      {
        customer_id,
        product_id,
        date,
        shift,
        quantity,
        price_per_unit,
      },
    ])
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
