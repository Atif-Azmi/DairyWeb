import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", user.id)
      .single() as { data: any | null };

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const now = new Date();
    const trialEnd = profile.trial_end_date ? new Date(profile.trial_end_date) : null;
    const subEnd = profile.subscription_end_date ? new Date(profile.subscription_end_date) : null;

    let computedStatus = profile.subscription_status;
    let isLocked = profile.is_locked || false;

    // Auto-expiry check
    if (computedStatus === "trial" && trialEnd && trialEnd < now) {
      computedStatus = "expired";
      isLocked = true;
    } else if (computedStatus === "active" && subEnd && subEnd < now) {
      computedStatus = "expired";
      isLocked = true;
    }

    // Sync back to DB if changed
    if (computedStatus !== profile.subscription_status || isLocked !== profile.is_locked) {
      await supabase
        .from("user_profiles")
        .update({ 
          subscription_status: computedStatus,
          is_locked: isLocked,
          subscription_plan: computedStatus === "expired" ? "none" : profile.subscription_plan
        })
        .eq("id", user.id);
    }

    return NextResponse.json({
      plan: profile.subscription_plan,
      status: computedStatus,
      isLocked,
      trialEndDate: profile.trial_end_date,
      subscriptionEndDate: profile.subscription_end_date,
      daysLeftInTrial: trialEnd ? Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))) : 0,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
