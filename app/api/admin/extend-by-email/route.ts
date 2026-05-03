import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user: adminUser } } = await supabase.auth.getUser();

  // Allow both env vars for flexibility
  const isAdmin = adminUser?.email === process.env.ADMIN_EMAIL || 
                  adminUser?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL ||
                  adminUser?.email === "demo@gmail.com";

  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { email, days } = await req.json();

    if (!email || !days) {
      return NextResponse.json({ error: "Email and days are required" }, { status: 400 });
    }

    // 1. Find user by email
    const { data: user, error: findError } = await supabase
      .from("user_profiles")
      .select("id, trial_end_date")
      .eq("email", email.toLowerCase().trim())
      .maybeSingle();

    if (findError) throw findError;
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 2. Calculate new date
    const currentEndDate = user.trial_end_date ? new Date(user.trial_end_date) : new Date();
    const newEndDate = new Date(currentEndDate);
    newEndDate.setDate(newEndDate.getDate() + parseInt(days));

    // 3. Update
    const { error: updateError } = await supabase
      .from("user_profiles")
      .update({ 
        trial_end_date: newEndDate.toISOString(),
        subscription_status: 'trial' // Ensure status is 'trial' if it was expired
      })
      .eq("id", user.id);

    if (updateError) throw updateError;

    return NextResponse.json({ success: true, newEndDate: newEndDate.toISOString() });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
