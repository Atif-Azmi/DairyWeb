import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedSupabase } from "@/lib/auth-api";

export async function GET() {
  const auth = await getAuthenticatedSupabase();
  if (!auth.ok) return auth.response;

  const { data, error } = await auth.supabase
    .from("customers")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const auth = await getAuthenticatedSupabase();
  if (!auth.ok) return auth.response;

  const { name, phone, address, default_milk_qty, custom_milk_rate } =
    await req.json();

  if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

  const { data, error } = await auth.supabase
    .from("customers")
    .insert([{ name, phone, address, default_milk_qty, custom_milk_rate }])
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
