"use client";

import { useState } from "react";
import { useI18n } from "@/components/i18n/LanguageProvider";
import { CheckIcon, LockClosedIcon } from "@heroicons/react/24/outline";

export default function SubscriptionPage() {
  const { t } = useI18n();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (planId: string) => {
    setLoading(planId);
    try {
      const res = await fetch("/api/subscriptions/create", {
        method: "POST",
        body: JSON.stringify({ planId }),
      });
      const { subscriptionId, error } = await res.json();
      
      if (error) throw new Error(error);

      // Load Razorpay Checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        subscription_id: subscriptionId,
        name: "Dairy Management Pro",
        description: `Subscription for ${planId}`,
        handler: function (response: any) {
          window.location.href = "/dashboard?success=true";
        },
        prefill: {
          name: "",
          email: "",
          contact: "",
        },
        theme: {
          color: "#059669",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      alert("Failed to initiate subscription");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-12 px-4">
      <div className="text-center mb-16 animate-fadeUp">
        <h1 className="text-4xl font-bold text-foreground mb-4">Choose Your Plan</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Start with a 7-day free trial. Unlock powerful WhatsApp automation and management tools.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Plan 1 */}
        <div className="bg-white rounded-3xl border border-border p-8 shadow-sm hover:shadow-md transition-all animate-fadeUp delay-100">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground">Standard Plan</h2>
            <p className="text-muted-foreground mt-2">Perfect for growing dairies</p>
            <div className="mt-4 flex items-baseline">
              <span className="text-4xl font-bold text-foreground">₹459</span>
              <span className="text-muted-foreground ml-2">/ month</span>
            </div>
          </div>

          <ul className="space-y-4 mb-10">
            <FeatureItem text="Full Dashboard & Analytics" />
            <FeatureItem text="Customer Ledger Management" />
            <FeatureItem text="Billing & PDF Export" />
            <FeatureItem text="Manual WhatsApp Sharing" />
            <FeatureItem text="7-Day Free Trial" />
          </ul>

          <button
            onClick={() => handleSubscribe("plan1")}
            disabled={!!loading}
            className="w-full py-4 bg-emerald-50 text-emerald-700 font-bold rounded-2xl hover:bg-emerald-100 transition-colors"
          >
            {loading === "plan1" ? "Loading..." : "Start Free Trial"}
          </button>
        </div>

        {/* Plan 2 */}
        <div className="bg-emerald-600 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all relative overflow-hidden animate-fadeUp delay-200">
          <div className="absolute top-0 right-0 p-4">
            <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest">
              Most Popular
            </span>
          </div>
          
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white">Premium Plan</h2>
            <p className="text-emerald-100 mt-2">Maximum recovery & automation</p>
            <div className="mt-4 flex items-baseline">
              <span className="text-4xl font-bold text-white">₹569</span>
              <span className="text-emerald-100 ml-2">/ month</span>
            </div>
          </div>

          <ul className="space-y-4 mb-10">
            <FeatureItem text="Everything in Standard" dark />
            <FeatureItem text="Automatic Overdue Reminders" dark />
            <FeatureItem text="Bulk WhatsApp Reminders" dark />
            <FeatureItem text="Daily Cron Automation" dark />
            <FeatureItem text="Priority Admin Support" dark />
          </ul>

          <button
            onClick={() => handleSubscribe("plan2")}
            disabled={!!loading}
            className="w-full py-4 bg-white text-emerald-600 font-bold rounded-2xl hover:bg-emerald-50 transition-colors shadow-lg"
          >
            {loading === "plan2" ? "Loading..." : "Go Premium"}
          </button>
        </div>
      </div>
    </div>
  );
}

function FeatureItem({ text, dark }: { text: string; dark?: boolean }) {
  return (
    <li className="flex items-center">
      <CheckIcon className={`h-5 w-5 mr-3 ${dark ? "text-emerald-200" : "text-emerald-500"}`} />
      <span className={dark ? "text-emerald-50" : "text-foreground"}>{text}</span>
    </li>
  );
}
