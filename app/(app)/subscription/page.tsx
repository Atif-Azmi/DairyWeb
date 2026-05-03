"use client";

import React, { useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useSubscription } from "@/hooks/useSubscription";
import { CheckIcon } from "@heroicons/react/24/outline";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const PLANS = [
  {
    id: "plan1",
    name: "Plan 1",
    price: 359,
    description: "Ideal for basic dairy operations",
    features: [
      "Store and Manage Data",
      "Generate & Download PDF Bills",
      "Customer Ledger Management",
      "Multi-tenant Access",
    ],
  },
  {
    id: "plan2",
    name: "Plan 2 (Premium)",
    price: 559,
    description: "Complete automation for your dairy",
    features: [
      "All Plan 1 features",
      "Share Bills via WhatsApp",
      "Auto Payment Reminders",
      "Advanced Analytics",
      "Priority Support",
    ],
    popular: true,
  },
];

export default function SubscriptionPage() {
  const { subscription, loading } = useSubscription();
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      
      // Wait up to 3 seconds for the script from RootLayout to load
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        if (window.Razorpay) {
          clearInterval(interval);
          resolve(true);
        } else if (attempts > 30) { // 3 seconds
          clearInterval(interval);
          resolve(false);
        }
      }, 100);
    });
  };

  const handleUpgrade = async (planId: string) => {
    console.log("Upgrade requested for plan:", planId);
    setIsProcessing(planId);
    
    try {
      // 1. Force load script if missing
      const loaded = await loadRazorpayScript();
      
      if (!loaded || !window.Razorpay) {
        console.error("Razorpay SDK could not be loaded");
        alert("Payment system blocked! Please disable your Ad-blocker or try a different internet connection (like your phone's hotspot).");
        setIsProcessing(null);
        return;
      }

      console.log("Creating order for:", planId);
      const orderRes = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId }),
      });

      const orderData = await orderRes.json();
      console.log("Order API response:", orderData);

      if (orderData.error) {
        throw new Error("Order API Error: " + orderData.error);
      }

      const options = {
        key: orderData.key || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: "INR",
        name: "Dairy Management Pro",
        description: `Upgrade to ${planId === "plan1" ? "Plan 1" : "Plan 2"}`,
        order_id: orderData.orderId,
        handler: async (response: any) => {
          console.log("Razorpay success response:", response);
          const verifyRes = await fetch("/api/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...response,
              plan: planId,
            }),
          });

          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            alert("Payment successful! Your plan has been upgraded.");
            window.location.reload();
          } else {
            alert("Payment verification failed: " + verifyData.error);
          }
        },
        modal: {
          ondismiss: function() {
            console.log("Payment modal closed by user");
            setIsProcessing(null);
          }
        },
        prefill: {
          name: subscription?.name || "",
          email: subscription?.email || "",
        },
        theme: {
          color: "#10b981",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response: any){
        console.error("Payment failed:", response.error);
        alert("Payment Failed: " + response.error.description);
        setIsProcessing(null);
      });
      rzp.open();
    } catch (error: any) {
      console.error("Upgrade Flow Error:", error);
      alert("Error: " + (error.message || "Something went wrong while starting the payment."));
      setIsProcessing(null);
    }
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading subscription data...</div>;

  return (
    <div className="max-w-5xl mx-auto py-12 px-4 space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold text-foreground tracking-tight sm:text-5xl">
          Simple, Transparent Pricing
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Choose the plan that fits your dairy operations. Start with a 7-day free trial.
        </p>
      </div>

      {subscription?.computedStatus === "expired" && (
        <div className="bg-destructive/10 border border-destructive/20 p-6 rounded-2xl text-center">
          <p className="text-destructive font-bold text-lg">
            Your {subscription.isTrial ? "Trial" : "Subscription"} has expired!
          </p>
          <p className="text-muted-foreground">Please upgrade to continue using the application features.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        {PLANS.map((plan) => (
          <Card 
            key={plan.id} 
            className={`flex flex-col relative h-full transition-all duration-300 hover:shadow-2xl ${
              plan.popular ? "border-primary ring-2 ring-primary/20" : "border-border"
            }`}
          >
            {plan.popular && (
              <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Most Popular
              </span>
            )}
            
            <div className="p-8 space-y-6 flex-grow">
              <div className="space-y-2 text-center">
                <h3 className="text-2xl font-bold">{plan.name}</h3>
                <p className="text-muted-foreground">{plan.description}</p>
              </div>

              <div className="text-center">
                <span className="text-5xl font-extrabold">₹{plan.price}</span>
                <span className="text-muted-foreground">/month</span>
              </div>

              <ul className="space-y-4 py-6 border-y border-border">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckIcon className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground/80">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-8 pt-0">
              <Button
                className="w-full h-12 text-lg font-bold shadow-lg"
                variant={plan.popular ? "primary" : "outline"}
                onClick={() => handleUpgrade(plan.id)}
                disabled={isProcessing === plan.id || subscription?.subscription_plan === plan.id}
              >
                {subscription?.subscription_plan === plan.id 
                  ? "Current Plan" 
                  : isProcessing === plan.id ? "Processing..." : "Upgrade Now"}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <div className="text-center p-8 bg-secondary/30 rounded-2xl">
        <p className="text-muted-foreground">
          Currently on: <span className="font-bold text-foreground uppercase">{subscription?.subscription_plan || "Trial"}</span> ({subscription?.computedStatus})
        </p>
        {subscription?.isTrial && subscription.computedStatus !== "expired" && (
          <p className="text-sm text-primary font-medium mt-2">
            Trial ends in {subscription.daysLeftInTrial} days
          </p>
        )}
      </div>
    </div>
  );
}
