import { useEffect, useState } from "react";
import { supabaseClient as supabase } from "@/lib/supabaseClient";

export function useSubscription() {
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getSub() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }

        const { data }: { data: any } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();

        const now = new Date();
        const trialEnd = data?.trial_end_date ? new Date(data.trial_end_date) : null;
        const subEnd = data?.subscription_end_date ? new Date(data.subscription_end_date) : null;

        let status = data?.subscription_status || 'inactive';
        if (status === "trial" && trialEnd && trialEnd < now) {
          status = "expired";
        } else if (status === "active" && subEnd && subEnd < now) {
          status = "expired";
        }

        // Logic for others: must have active trial or paid plan
        // Logic for Admin: Always active
        const isAdmin = user.email?.toLowerCase().trim() === "demo@gmail.com" || 
                        user.email?.toLowerCase().trim() === process.env.NEXT_PUBLIC_ADMIN_EMAIL?.toLowerCase().trim();
        
        const isTrialActive = (status === "trial" || data?.plan === "free") && trialEnd && trialEnd > now;

        const subObj = {
          ...data,
          email: data?.email || user.email,
          computedStatus: isTrialActive ? "trial" : (isAdmin ? "admin" : status),
          isTrialActive: isAdmin || isTrialActive,
          isPremium: isAdmin || data?.subscription_plan === "plan2" || isTrialActive, 
          isStandard: isAdmin || data?.subscription_plan === "plan1" || data?.subscription_plan === "plan2" || isTrialActive,
          isAdmin,
          isExpired: !isAdmin && !isTrialActive && status === "expired",
          isTrial: !isAdmin && isTrialActive,
          daysLeftInTrial: isAdmin ? 999 : (trialEnd ? Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))) : 0),
        };

        setSubscription(subObj);
      } catch (err) {
        console.error("Error in useSubscription:", err);
      } finally {
        setLoading(false);
      }
    }

    getSub();
  }, []);

  return { subscription, loading };
}
