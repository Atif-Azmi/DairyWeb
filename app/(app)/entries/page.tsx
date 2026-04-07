"use client";

import React, { useState, useEffect, useCallback } from "react";
import { supabaseClient } from "@/lib/supabaseClient";
import { withTimeout } from "@/lib/withTimeout";
import EntryForm from "@/components/forms/EntryForm";
import Card from "@/components/ui/Card";
import { useI18n } from "@/components/i18n/LanguageProvider";

const FETCH_MS = 18_000;

interface DailyEntry {
  id: string;
  date: string;
  shift: string;
  quantity: number;
  total_amount: number;
  customers: { name: string };
  products: { name: string };
}

const EntriesPage = () => {
  const { t, lang } = useI18n();
  const [customers, setCustomers] = useState<{ id: string; name: string }[]>([]);
  const [products, setProducts] = useState<
    { id: number; name: string; default_rate: number }[]
  >([]);
  const [todaysEntries, setTodaysEntries] = useState<DailyEntry[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  const fetchTodaysEntries = useCallback(async () => {
    const today = new Date().toISOString().slice(0, 10);
    try {
      const { data, error } = await withTimeout(
        supabaseClient
          .from("entries")
          .select(
            "id, date, shift, quantity, total_amount, customers(name), products(name)"
          )
          .eq("date", today)
          .order("id", { ascending: false }),
        FETCH_MS
      );

      if (error) {
        console.error("Error fetching today's entries:", error);
        return error;
      }
      setTodaysEntries((data as unknown as DailyEntry[]) || []);
      return null;
    } catch (e) {
      const err = e instanceof Error ? e : new Error("Failed to load entries");
      return err;
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoadError(null);
      try {
        const { data: customersData, error: cErr } = await withTimeout(
          supabaseClient.from("customers").select("id, name"),
          FETCH_MS
        );
        const { data: productsData, error: pErr } = await withTimeout(
          supabaseClient.from("products").select("id, name, default_rate"),
          FETCH_MS
        );

        if (cErr || pErr) {
          setLoadError(cErr?.message ?? pErr?.message ?? "Could not load form data");
          setCustomers([]);
          setProducts([]);
          return;
        }

        setCustomers(customersData || []);
        setProducts(productsData || []);
        const entryErr = await fetchTodaysEntries();
        if (entryErr) {
          setLoadError(entryErr.message);
        }
      } catch (e) {
        console.error(e);
        setLoadError(e instanceof Error ? e.message : "Failed to load page");
        setCustomers([]);
        setProducts([]);
      }
    };

    fetchData();
  }, [fetchTodaysEntries]);

  const handleEntrySaved = () => {
    fetchTodaysEntries();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-foreground">{t("entries.title")}</h1>
      {loadError && (
        <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
          {loadError}
        </p>
      )}
      <Card title={lang === "hi" ? "नई एंट्री जोड़ें" : "Add New Entry"}>
        {customers.length === 0 || products.length === 0 ? (
          <p className="text-muted-foreground py-2">
            Add at least one customer and one product before recording entries.
          </p>
        ) : (
          <EntryForm
            customers={customers}
            products={products}
            onSuccess={handleEntrySaved}
          />
        )}
      </Card>

      <Card title={lang === "hi" ? "आज की एंट्री" : "Today's Entries"}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-secondary/80">
              <tr>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Shift</th>
                <th className="px-4 py-3 text-right">Quantity</th>
                <th className="px-4 py-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {todaysEntries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-4 text-muted-foreground">
                    No entries for today yet.
                  </td>
                </tr>
              ) : (
                todaysEntries.map((entry) => (
                  <tr
                    key={entry.id}
                    className="border-b border-border hover:bg-secondary/40 transition-colors"
                  >
                    <td className="px-4 py-2 font-medium">
                      {entry.customers?.name}
                    </td>
                    <td className="px-4 py-2">{entry.products?.name}</td>
                    <td className="px-4 py-2 capitalize">{entry.shift}</td>
                    <td className="px-4 py-2 text-right">{entry.quantity}</td>
                    <td className="px-4 py-2 text-right">
                      ₹{Number(entry.total_amount).toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default EntriesPage;
