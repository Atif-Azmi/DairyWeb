import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedSupabase } from "@/lib/auth-api";

export async function GET() {
  const auth = await getAuthenticatedSupabase();
  if (!auth.ok) return auth.response;

  const { data, error } = await auth.supabase
    .from("dairy_profile")
    .select("*")
    .eq("id", 1)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest) {
  const auth = await getAuthenticatedSupabase();
  if (!auth.ok) return auth.response;

  const body = await req.json();
  const allowed = [
    "dairy_name",
    "tagline",
    "address",
    "phone",
    "gst",
    "logo_url",
  ] as const;
  const payload: Record<string, string | undefined> = {};
  for (const key of allowed) {
    if (body[key] !== undefined) payload[key] = body[key];
  }

  const { data, error } = await auth.supabase
    .from("dairy_profile")
    .upsert(
      { id: 1, ...payload, updated_at: new Date().toISOString() },
      { onConflict: "id" }
    )
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
