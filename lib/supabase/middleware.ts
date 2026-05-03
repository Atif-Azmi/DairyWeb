import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import type { Database } from "@/lib/database.types";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  // 1. Auth & Redirects
  if (path === "/" && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url, { status: 303 });
  }

  if ((path === "/login" || path === "/signup") && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url, { status: 303 });
  }

  // 2. Subscription Check
  if (user) {
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("subscription_plan, subscription_status, trial_end_date, subscription_end_date, is_locked")
      .eq("id", user.id)
      .single();

    if (profile) {
      const now = new Date();
      let status = profile.subscription_status;
      const trialEnd = profile.trial_end_date ? new Date(profile.trial_end_date) : null;
      const subEnd = profile.subscription_end_date ? new Date(profile.subscription_end_date) : null;

      const isTrialActive = status === "trial" && trialEnd && trialEnd > now;

      // Check for expiry
      if (status === "trial" && trialEnd && trialEnd < now) {
        status = "expired";
      } else if (status === "active" && subEnd && subEnd < now) {
        status = "expired";
      }

      const isProtectedApp =
        path.startsWith("/dashboard") ||
        path.startsWith("/customers") ||
        path.startsWith("/entries") ||
        path.startsWith("/products") ||
        path.startsWith("/billing") ||
        path.startsWith("/ledger") ||
        path.startsWith("/settings") ||
        path.startsWith("/retail");

      const isSubscriptionPage = path.startsWith("/subscription");

      // Redirect expired users to subscription page
      if (status === "expired" || profile.is_locked) {
        const isAllowedRoute = 
          path.startsWith("/subscription") || 
          path.startsWith("/api/create-order") || 
          path.startsWith("/api/verify-payment") ||
          path.startsWith("/api/auth") ||
          path.startsWith("/api/subscription-status");

        if (!isAllowedRoute) {
          if (path.startsWith("/api/")) {
            return NextResponse.json({ error: "Account locked. Please purchase a plan." }, { status: 403 });
          }
          const url = request.nextUrl.clone();
          url.pathname = "/subscription";
          url.searchParams.set("reason", "locked");
          return NextResponse.redirect(url, { status: 303 });
        }
      }

      // Feature Gating: Plan 1 Restrictions (Only if trial is NOT active)
      if (profile.subscription_plan === "plan1" && !isTrialActive) {
        const isRestrictedPath = 
          path.startsWith("/api/whatsapp") || 
          path.startsWith("/api/automation");

        if (isRestrictedPath) {
          return NextResponse.json({ error: "Feature requires Premium Plan (Plan 2)" }, { status: 403 });
        }
      }
    }
  }

  const isProtectedApp =
    path.startsWith("/dashboard") ||
    path.startsWith("/customers") ||
    path.startsWith("/entries") ||
    path.startsWith("/products") ||
    path.startsWith("/billing") ||
    path.startsWith("/ledger") ||
    path.startsWith("/settings") ||
    path.startsWith("/retail");

  const isProtectedApi =
    path.startsWith("/api/") &&
    !path.startsWith("/api/auth") &&
    !path.startsWith("/api/create-order") &&
    !path.startsWith("/api/verify-payment");

  if (isProtectedApp && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", path);
    return NextResponse.redirect(url, { status: 303 });
  }

  if (isProtectedApi && !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return supabaseResponse;
}
