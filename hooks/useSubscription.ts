import { useEffect, useState } from "react";
import { supabaseClient as supabase } from "@/lib/supabaseClient";

export function useSubscription() {
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getSub() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (data) {
        // Calculate trial status
        const trialStart = new Date(data.trial_start_date);
        const trialEnd = new Date(trialStart);
        trialEnd.setDate(trialEnd.getDate() + 7);
        const isTrialActive = new Date() < trialEnd;

        setSubscription({
          ...data,
          isTrialActive,
          isPremium: data.plan === "plan2",
          isStandard: data.plan === "plan1" || data.plan === "plan2",
          daysLeftInTrial: Math.max(0, Math.ceil((trialEnd.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))),
        });
      }
      setLoading(false);
    }

    getSub();
  }, []);

  return { subscription, loading };
}
