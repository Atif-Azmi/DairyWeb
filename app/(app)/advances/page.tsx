"use client";

import React, { useState, useEffect, useCallback } from "react";
import { supabaseClient } from "@/lib/supabaseClient";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import { useI18n } from "@/components/i18n/LanguageProvider";

interface CustomerBalance {
  customer_id: string;
  name: string;
  balance: number;
  total_sales: number;
  total_paid: number;
  phone?: string | null;
  dairy_name?: string;
}

export default function AdvancesPage() {
  const { t, lang } = useI18n();
  const [customers, setCustomers] = useState<CustomerBalance[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [selectedCustomer, setSelectedCustomer] = useState<CustomerBalance | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState<"cash" | "online" | "upi">("cash");
  const [type, setType] = useState<"advance" | "payment">("advance");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadBalances = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: rows, error: cErr } = await supabaseClient
        .from("daily_customers" as any)
        .select("id, name, phone");

      if (cErr) throw cErr;

      const { data: entries, error: eErr } = await supabaseClient
        .from("daily_entries" as any)
        .select("customer_id, total_amount") as { data: any[] | null; error: any };
      
      const { data: txs, error: tErr } = await supabaseClient
        .from("daily_transactions" as any)
        .select("customer_id, amount") as { data: any[] | null; error: any };

      if (eErr || tErr) throw (eErr || tErr);

      const { data: profile } = await supabaseClient
        .from("daily_profile")
        .select("dairy_name")
        .eq("id", 1)
        .maybeSingle();

      const salesMap = new Map<string, number>();
      const paidMap = new Map<string, number>();

      for (const e of entries || []) {
        const id = e.customer_id;
        salesMap.set(id, (salesMap.get(id) || 0) + Number(e.total_amount || 0));
      }
      for (const t of txs || []) {
        const id = t.customer_id;
        paidMap.set(id, (paidMap.get(id) || 0) + Number(t.amount || 0));
      }

      const merged: CustomerBalance[] = (rows || []).map((c: any) => {
        const sales = salesMap.get(c.id) || 0;
        const paid = paidMap.get(c.id) || 0;
        return {
          customer_id: c.id,
          name: c.name,
          phone: c.phone,
          total_sales: sales,
          total_paid: paid,
          balance: sales - paid,
          dairy_name: (profile as any)?.dairy_name || "Dairy",
        };
      });

      setCustomers(merged);
    } catch (err) {
      console.error("Error loading balances:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBalances();
  }, [loadBalances]);

  const openModal = (customer: CustomerBalance) => {
    setSelectedCustomer(customer);
    setType(customer.balance > 0 ? "payment" : "advance"); // Default based on balance
    setAmount(Math.abs(customer.balance).toString() || "");
    setIsModalOpen(true);
  };

  const handleRemindWhatsApp = (customer: CustomerBalance) => {
    if (!customer.phone) {
      alert(lang === "hi" ? "इस ग्राहक का फ़ोन नंबर मौजूद नहीं है।" : "Phone number missing for this customer.");
      return;
    }
    const text = `Dear ${customer.name},\n\nGreetings from *${(customer as any).dairy_name}*! 🥛\n\nWe hope you're enjoying our dairy products! This is a friendly reminder regarding your pending payment of ₹${customer.balance.toFixed(2)}.\n\nPlease clear the dues at your earliest convenience. Thank you!`;
    
    let phoneStr = customer.phone.replace(/\D/g, "");
    if (phoneStr && phoneStr.length === 10) {
      phoneStr = "91" + phoneStr;
    }

    const wa = phoneStr 
      ? `https://wa.me/${phoneStr}?text=${encodeURIComponent(text)}`
      : `https://wa.me/?text=${encodeURIComponent(text)}`;
      
    window.open(wa, "_blank", "noopener,noreferrer");
  };

  const handleTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || !amount) return;
    setIsSubmitting(true);

    const today = new Date().toISOString().split("T")[0];

    const { error } = await supabaseClient.from("daily_transactions" as any).insert({
      customer_id: selectedCustomer.customer_id,
      type: type,
      amount: Number(amount),
      payment_mode: paymentMode,
      date: today,
    });

    if (!error) {
      setIsModalOpen(false);
      loadBalances();
    } else {
      alert("Error adding transaction: " + error.message);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-foreground">Advances & Dues Management</h1>

      <Card title="Customer Balances">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-secondary/80">
              <tr>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3 text-right">Total Sales</th>
                <th className="px-4 py-3 text-right">Total Paid</th>
                <th className="px-4 py-3 text-right">Balance</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="text-center py-4 text-muted-foreground">Loading...</td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-4 text-muted-foreground">No customers found.</td>
                </tr>
              ) : (
                customers.map((c) => {
                  // We need to calculate sales and paid again or pass them from loadBalances
                  // For now, let's use the balance and status
                  const isAdvance = c.balance < 0;
                  const isDue = c.balance > 0;
                  
                  return (
                    <tr key={c.customer_id} className="border-b border-border hover:bg-secondary/40 transition-colors">
                      <td className="px-4 py-3">
                        <Link href={`/ledger/${c.customer_id}`} className="font-bold text-primary hover:underline uppercase">
                          {c.name}
                        </Link>
                        {c.phone && <p className="text-xs text-muted-foreground mt-0.5">📞 {c.phone}</p>}
                      </td>
                      <td className="px-4 py-3 text-right text-muted-foreground">
                        ₹{c.total_sales.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right text-emerald-700">
                        ₹{c.total_paid.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex flex-col items-end">
                          <span className={`font-bold ${isDue ? "text-amber-700" : isAdvance ? "text-emerald-700" : ""}`}>
                            ₹{Math.abs(c.balance).toFixed(2)}
                          </span>
                          <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded mt-1 ${
                            isAdvance ? "bg-emerald-100 text-emerald-800" : isDue ? "bg-amber-100 text-amber-800" : "bg-gray-100 text-gray-600"
                          }`}>
                            {isAdvance ? "Advance" : isDue ? "Due" : "Settled"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2 flex-wrap">
                          {isDue && (
                            <Button size="sm" variant="outline" className="text-primary hover:bg-primary/10 border-primary/20" onClick={() => handleRemindWhatsApp(c)}>
                              Remind
                            </Button>
                          )}
                          <Button size="sm" onClick={() => openModal(c)}>
                            Add Payment
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
      {selectedCustomer && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={`Add Entry for ${selectedCustomer.name}`}
        >
          <form onSubmit={handleTransaction} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-2">Transaction Type</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="type"
                    value="advance"
                    checked={type === "advance"}
                    onChange={() => setType("advance")}
                    className="w-4 h-4 text-primary focus:ring-primary"
                  />
                  <span>Advance (Money taken beforehand)</span>
                </label>
              </div>
              <div className="flex gap-4 mt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="type"
                    value="payment"
                    checked={type === "payment"}
                    onChange={() => setType("payment")}
                    className="w-4 h-4 text-primary focus:ring-primary"
                  />
                  <span>Payment (Clearing due balance)</span>
                </label>
              </div>
            </div>

            <Input
              id="amount"
              label="Amount"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />

            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-2">Payment Mode</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="cash"
                    checked={paymentMode === "cash"}
                    onChange={() => setPaymentMode("cash")}
                    className="w-4 h-4 text-primary"
                  />
                  <span>Cash</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="online"
                    checked={paymentMode === "online"}
                    onChange={() => setPaymentMode("online")}
                    className="w-4 h-4 text-primary"
                  />
                  <span>Online</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="upi"
                    checked={paymentMode === "upi"}
                    onChange={() => setPaymentMode("upi")}
                    className="w-4 h-4 text-primary"
                  />
                  <span>UPI</span>
                </label>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Entry"}
            </Button>
          </form>
        </Modal>
      )}
    </div>
  );
}
