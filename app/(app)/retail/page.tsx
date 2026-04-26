"use client";

import React, { useState, useEffect, useCallback } from "react";
import { supabaseClient } from "@/lib/supabaseClient";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useI18n } from "@/components/i18n/LanguageProvider";

interface Product {
  id: number;
  name: string;
  default_rate: number;
}

interface RetailSale {
  total_amount: number;
  payment_mode: string;
}

export default function RetailPage() {
  const { t, lang } = useI18n();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("");
  const [rate, setRate] = useState<string>("");
  const [paymentMode, setPaymentMode] = useState<"cash" | "online">("cash");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [todayCash, setTodayCash] = useState(0);
  const [todayOnline, setTodayOnline] = useState(0);

  const loadData = useCallback(async () => {
    // Load products
    const { data: prods } = await supabaseClient.from("products").select("*");
    if (prods) setProducts(prods);

    // Load today's retail sales summary
    const today = new Date().toISOString().split("T")[0];
    const { data: sales } = await supabaseClient
      .from("retail_sales")
      .select("total_amount, payment_mode")
      .eq("date", today) as { data: RetailSale[] | null };

    let cash = 0;
    let online = 0;
    if (sales) {
      for (const sale of sales) {
        if (sale.payment_mode === "cash") cash += Number(sale.total_amount);
        if (sale.payment_mode === "online" || sale.payment_mode === "upi") online += Number(sale.total_amount);
      }
    }
    setTodayCash(cash);
    setTodayOnline(online);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Auto-fill rate when product changes
  useEffect(() => {
    if (selectedProductId) {
      const p = products.find((x) => x.id.toString() === selectedProductId);
      if (p) setRate(p.default_rate.toString());
    } else {
      setRate("");
    }
  }, [selectedProductId, products]);

  const totalAmount = (Number(quantity) || 0) * (Number(rate) || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || !quantity || !rate) return;
    setIsSubmitting(true);
    setMessage(null);

    const today = new Date().toISOString().split("T")[0];

    const { error } = await supabaseClient.from("retail_sales").insert({
      date: today,
      product_id: parseInt(selectedProductId),
      quantity: Number(quantity),
      total_amount: totalAmount,
      payment_mode: paymentMode,
    } as any);

    if (error) {
      if (error.code === '42P01') {
        setMessage({ type: "error", text: "Table retail_sales does not exist. Please run the SQL migration." });
      } else {
        setMessage({ type: "error", text: error.message });
      }
    } else {
      setMessage({ type: "success", text: "Retail sale saved!" });
      setQuantity("");
      loadData(); // Refresh summary
    }
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-foreground">Retail Sales</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="New Retail Entry">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1">Product</label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="flex h-10 w-full rounded-md border border-border bg-white/80 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                required
              >
                <option value="">Select Product</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Input
                id="quantity"
                label="Quantity"
                type="number"
                step="0.01"
                min="0.01"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
              <Input
                id="rate"
                label="Rate"
                type="number"
                step="0.01"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                required
              />
            </div>

            <div className="bg-secondary/40 p-3 rounded-md flex justify-between items-center">
              <span className="font-medium">Total Amount:</span>
              <span className="text-xl font-bold text-primary">₹{totalAmount.toFixed(2)}</span>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-2">Payment Mode</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMode"
                    value="cash"
                    checked={paymentMode === "cash"}
                    onChange={() => setPaymentMode("cash")}
                    className="w-4 h-4 text-primary focus:ring-primary"
                  />
                  <span>Cash</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMode"
                    value="online"
                    checked={paymentMode === "online"}
                    onChange={() => setPaymentMode("online")}
                    className="w-4 h-4 text-primary focus:ring-primary"
                  />
                  <span>Online / UPI</span>
                </label>
              </div>
            </div>

            {message && (
              <p className={`text-sm rounded-md px-3 py-2 ${message.type === "error" ? "text-destructive bg-destructive/10" : "text-emerald-700 bg-emerald-50"}`}>
                {message.text}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Retail Sale"}
            </Button>
          </form>
        </Card>

        <Card title="Today's Summary">
          <div className="space-y-6 mt-4">
            <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-emerald-800 text-sm font-medium">Cash Collected</p>
                <p className="text-3xl font-bold text-emerald-900">₹{todayCash.toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 text-2xl">
                💵
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 p-6 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-blue-800 text-sm font-medium">Online Collected</p>
                <p className="text-3xl font-bold text-blue-900">₹{todayOnline.toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-2xl">
                📱
              </div>
            </div>

            <div className="pt-4 border-t border-border flex justify-between items-center">
              <span className="font-semibold text-lg">Total Retail Sales</span>
              <span className="font-bold text-2xl">₹{(todayCash + todayOnline).toFixed(2)}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
