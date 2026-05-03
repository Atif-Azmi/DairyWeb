import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Basic check: You should add a proper 'admin' check here
  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { days } = await req.json();

    if (typeof days !== "number" || days < 0) {
      return NextResponse.json({ error: "Invalid duration" }, { status: 400 });
    }

    const { error } = await supabase
      .from("admin_settings")
      .upsert({ key: "trial_duration_days", value: JSON.stringify(days) });

    if (error) throw error;

    return NextResponse.json({ success: true, days });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
