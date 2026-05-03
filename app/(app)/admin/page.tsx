"use client";

import React, { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useSubscription } from "@/hooks/useSubscription";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const { subscription, loading: subLoading } = useSubscription();
  const router = useRouter();
  
  // Settings State
  const [trialDuration, setTrialDuration] = useState(7);
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState("");

  // Users State
  const [users, setUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);

  // Quick Extend State
  const [extendEmail, setExtendEmail] = useState("");
  const [extendDays, setExtendDays] = useState(7);
  const [extendLoading, setExtendLoading] = useState(false);

  useEffect(() => {
    if (!subLoading && !subscription?.isAdmin) {
      router.push("/dashboard");
    }
  }, [subscription, subLoading, router]);

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (res.ok) setUsers(data);
    } catch (e) {
      console.error("Failed to fetch users");
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    if (subscription?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
      fetchUsers();
    }
  }, [subscription]);

  const handleUpdateDuration = async () => {
    setIsUpdating(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/set-trial-duration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ days: trialDuration }),
      });
      if (res.ok) {
        setMessage("Global trial duration updated successfully!");
      } else {
        const err = await res.json();
        setMessage(`Error: ${err.error}`);
      }
    } catch (e) {
      setMessage("Failed to update trial duration.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleManualTrialUpdate = async (userId: string, currentEndDate: string, days: number) => {
    const newDate = new Date(currentEndDate || new Date());
    newDate.setDate(newDate.getDate() + days);
    
    try {
      const res = await fetch("/api/admin/update-user-trial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, trialEndDate: newDate.toISOString() }),
      });
      if (res.ok) {
        setMessage("User trial updated!");
        fetchUsers();
      }
    } catch (e) {
      setMessage("Failed to update user trial.");
    }
  };

  const handleQuickExtend = async () => {
    if (!extendEmail) return;
    setExtendLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/extend-by-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: extendEmail, days: extendDays }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(`Success! Extended trial for ${extendEmail}.`);
        setExtendEmail("");
        fetchUsers();
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (e) {
      setMessage("Failed to extend trial.");
    } finally {
      setExtendLoading(false);
    }
  };

  if (subLoading) return <div className="p-8 text-center">Checking admin status...</div>;

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">Admin Control Center</h1>
          <p className="text-muted-foreground">Manage global settings and user trials.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-xl text-sm font-bold text-slate-600">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Admin Access Granted
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-xl text-sm font-bold shadow-sm border ${
          message.includes("Success") || message.includes("updated") 
            ? "bg-emerald-50 border-emerald-100 text-emerald-700" 
            : "bg-red-50 border-red-100 text-red-700"
        }`}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Global Trial Settings">
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Set the default trial duration for NEW users. 
              Range: 3 to 14 days.
            </p>
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <Input
                  id="trial-duration"
                  label="Trial Duration (Days)"
                  type="number"
                  min={3}
                  max={14}
                  value={trialDuration}
                  onChange={(e) => setTrialDuration(parseInt(e.target.value))}
                />
              </div>
              <Button onClick={handleUpdateDuration} disabled={isUpdating}>
                {isUpdating ? "Updating..." : "Save Setting"}
              </Button>
            </div>
          </div>
        </Card>

        <Card title="Quick Trial Extension">
          <div className="space-y-4">
            <Input
              id="extend-email"
              label="Client Email ID"
              type="email"
              placeholder="client@gmail.com"
              value={extendEmail}
              onChange={(e) => setExtendEmail(e.target.value)}
            />
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <Input
                  id="extend-days"
                  label="Add Days"
                  type="number"
                  min={1}
                  value={extendDays}
                  onChange={(e) => setExtendDays(parseInt(e.target.value))}
                />
              </div>
              <Button onClick={handleQuickExtend} disabled={extendLoading}>
                {extendLoading ? "Extending..." : "Extend Trial"}
              </Button>
            </div>
          </div>
        </Card>

        <Card title="System Overview">
          <div className="space-y-2">
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Logged in as</span>
              <span className="text-sm font-bold">{subscription?.email}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Total Managed Users</span>
              <span className="text-sm font-bold">{users.filter(u => u.email !== "demo@gmail.com" && u.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL).length}</span>
            </div>
          </div>
        </Card>
      </div>

      <Card title="User Management">
        <div className="overflow-x-auto -mx-6 px-6">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="py-4 px-2 font-bold text-slate-500 uppercase text-[10px] tracking-wider">User Email</th>
                <th className="py-4 px-2 font-bold text-slate-500 uppercase text-[10px] tracking-wider">Current Plan</th>
                <th className="py-4 px-2 font-bold text-slate-500 uppercase text-[10px] tracking-wider">Trial Ends On</th>
                <th className="py-4 px-2 font-bold text-slate-500 uppercase text-[10px] tracking-wider">Trial Control</th>
              </tr>
            </thead>
            <tbody>
              {usersLoading ? (
                <tr><td colSpan={4} className="py-8 text-center text-muted-foreground animate-pulse">Loading user database...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={4} className="py-8 text-center text-muted-foreground">No users found.</td></tr>
              ) : (
                users
                  .filter(u => u.email !== "demo@gmail.com" && u.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL)
                  .map((u) => (
                  <tr key={u.id} className="border-b border-border/50 hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-2 font-medium">{u.email}</td>
                    <td className="py-4 px-2">
                      <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${u.plan === 'plan2' ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-600'}`}>
                        {u.plan}
                      </span>
                    </td>
                    <td className="py-4 px-2 font-mono text-xs">
                      {u.trial_end_date ? new Date(u.trial_end_date).toLocaleDateString(undefined, { dateStyle: 'medium' }) : "No Trial"}
                    </td>
                    <td className="py-4 px-2 flex gap-2">
                      <Button size="sm" variant="outline" className="h-8 px-2 text-[10px]" onClick={() => handleManualTrialUpdate(u.id, u.trial_end_date, 1)}>+1 Day</Button>
                      <Button size="sm" variant="outline" className="h-8 px-2 text-[10px]" onClick={() => handleManualTrialUpdate(u.id, u.trial_end_date, -1)}>-1 Day</Button>
                      <Button size="sm" variant="outline" className="h-8 px-2 text-[10px]" onClick={() => handleManualTrialUpdate(u.id, u.trial_end_date, 7)}>+1 Week</Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="Database Setup Instruction">
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-100 rounded-xl text-amber-800">
            <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-amber-200 rounded-full text-lg font-bold">!</span>
            <div className="text-xs">
              <p className="font-bold uppercase tracking-wide">Action Required: Run SQL in Supabase</p>
              <p className="opacity-80">To make the trial duration dynamic for new signups, copy and paste this SQL into your Supabase SQL Editor.</p>
            </div>
          </div>
          
          <div className="relative group">
            <div className="absolute top-3 right-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
              SQL Function
            </div>
            <pre className="bg-[#1e293b] text-blue-100 p-6 rounded-2xl overflow-x-auto text-[11px] leading-relaxed font-mono shadow-inner border border-slate-700 max-h-[400px] scrollbar-thin scrollbar-thumb-slate-600">
{`CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_trial_days int;
BEGIN
    -- Fetch from admin_settings, default to 7 if missing
    SELECT (value::int) INTO v_trial_days 
    FROM public.admin_settings 
    WHERE key = 'trial_duration_days';

    IF v_trial_days IS NULL THEN v_trial_days := 7; END IF;

    INSERT INTO public.user_profiles (
      id, name, email, plan, trial_start_date, trial_end_date, subscription_status
    )
    VALUES (
      new.id,
      COALESCE(new.raw_user_meta_data->>'full_name', 'New User'),
      new.email,
      'free',
      NOW(),
      NOW() + (v_trial_days || ' days')::interval,
      'trial'
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- To enable the trigger, run this too:
-- DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE FUNCTION handle_new_user();`}
            </pre>
          </div>
          <p className="text-[10px] italic text-slate-400 text-center">This function ensures every new signup gets the correct trial duration automatically.</p>
        </div>
      </Card>
    </div>
  );
}
