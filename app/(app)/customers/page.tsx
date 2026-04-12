"use client";

import React, { useEffect, useState, useCallback } from "react";
import { supabaseClient } from "@/lib/supabaseClient";
import { withTimeout } from "@/lib/withTimeout";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import CustomerForm from "@/components/forms/CustomerForm";
import TransactionForm from "@/components/forms/TransactionForm";
import { useI18n } from "@/components/i18n/LanguageProvider";

const FETCH_MS = 18_000;

interface CustomerSummary {
  id: string;
  name: string;
  phone?: string | null;
  address?: string | null;
  total_sales: number;
  total_paid: number;
  balance: number;
}

const CustomersPage = () => {
  const { t, lang } = useI18n();
  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [paymentCustomer, setPaymentCustomer] = useState<CustomerSummary | null>(
    null
  );
  const [editingCustomer, setEditingCustomer] = useState<CustomerSummary | null>(
    null
  );

  const fetchCustomerSummaries = useCallback(async () => {
    setLoadError(null);
    try {
      const { data: rows, error: cErr } = await withTimeout(
        supabaseClient.from("customers").select("id, name, phone, address"),
        FETCH_MS
      );

      if (cErr) {
        console.error(cErr);
        setLoadError(cErr.message);
        setCustomers([]);
        return;
      }

      const { data: entries, error: eErr } = await withTimeout(
        supabaseClient.from("entries").select("customer_id, total_amount"),
        FETCH_MS
      );
      const { data: txs, error: tErr } = await withTimeout(
        supabaseClient.from("transactions").select("customer_id, amount"),
        FETCH_MS
      );

      if (eErr || tErr) {
        setLoadError(eErr?.message ?? tErr?.message ?? "Could not load balances");
        setCustomers([]);
        return;
      }

      const salesMap = new Map<string, number>();
      const paidMap = new Map<string, number>();

      for (const e of entries || []) {
        const id = e.customer_id as string;
        salesMap.set(id, (salesMap.get(id) || 0) + Number(e.total_amount || 0));
      }
      for (const t of txs || []) {
        const id = t.customer_id as string;
        paidMap.set(id, (paidMap.get(id) || 0) + Number(t.amount || 0));
      }

      const list: CustomerSummary[] = (rows || []).map((c) => {
        const sales = salesMap.get(c.id) || 0;
        const paid = paidMap.get(c.id) || 0;
        return {
          id: c.id,
          name: c.name,
          phone: c.phone,
          address: c.address,
          total_sales: sales,
          total_paid: paid,
          balance: sales - paid,
        };
      });

      setCustomers(list);
    } catch (e) {
      console.error(e);
      setLoadError(e instanceof Error ? e.message : "Failed to load customers");
      setCustomers([]);
    }
  }, []);

  useEffect(() => {
    fetchCustomerSummaries();
  }, [fetchCustomerSummaries]);

  const openModalForNew = () => {
    setEditingCustomer(null);
    setIsModalOpen(true);
  };

  const openModalForEdit = (customer: CustomerSummary) => {
    setEditingCustomer(customer);
    setIsModalOpen(true);
  };

  const handleSuccess = () => {
    setIsModalOpen(false);
    fetchCustomerSummaries();
  };

  const handlePaymentSuccess = () => {
    setIsPaymentOpen(false);
    setPaymentCustomer(null);
    fetchCustomerSummaries();
  };

  const filteredCustomers = customers.filter((c) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      (c.phone || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCustomer ? (lang === "hi" ? "ग्राहक संपादित करें" : "Edit Customer") : (lang === "hi" ? "नया ग्राहक जोड़ें" : "Add New Customer")}
      >
        <CustomerForm
          customer={
            editingCustomer
              ? {
                  id: editingCustomer.id,
                  name: editingCustomer.name,
                  phone: editingCustomer.phone,
                  address: editingCustomer.address,
                }
              : null
          }
          onSuccess={handleSuccess}
        />
      </Modal>

      <Modal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        title={lang === "hi" ? "भुगतान / एडवांस जोड़ें" : "Add Payment / Advance"}
      >
        {paymentCustomer ? (
          <TransactionForm
            customerId={paymentCustomer.id}
            onSuccess={handlePaymentSuccess}
            defaultType={paymentCustomer.balance > 0 ? "payment" : "advance"}
          />
        ) : null}
      </Modal>

      <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{t("customers.title")}</h1>
      <div className="flex max-w-xl flex-col gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by customer name or phone"
          className="h-11 w-full rounded-md border border-border bg-white/90 px-3 py-2 text-base sm:text-sm touch-manipulation"
          aria-label="Search customers"
        />
        <Button
          type="button"
          onClick={openModalForNew}
          className="h-12 min-h-[48px] w-full text-base font-semibold sm:w-auto sm:self-start sm:px-8 touch-manipulation"
        >
          {t("customers.add")}
        </Button>
      </div>

      <Card title={lang === "hi" ? "सभी ग्राहक" : "All Customers"}>
        {loadError && (
          <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2 mb-4">
            {loadError}
          </p>
        )}
        {filteredCustomers.length === 0 && !loadError ? (
          <p className="text-muted-foreground py-6 text-center">
            {customers.length === 0
              ? "No customers yet. Use \"Add Customer\" to create one."
              : "No customer matches your search."}
          </p>
        ) : filteredCustomers.length === 0 ? null : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-secondary/80">
                <tr>
                  <th className="px-4 py-3">{lang === "hi" ? "ग्राहक विवरण" : "Customer Details"}</th>
                  <th className="px-4 py-3 text-right">Total Sales</th>
                  <th className="px-4 py-3 text-right">Total Paid</th>
                  <th className="px-4 py-3 text-right">Balance</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-border hover:bg-secondary/40 transition-colors"
                  >
                    <td className="px-4 py-2">
                      <Link
                        href={`/ledger/${c.id}`}
                        className="font-semibold text-primary hover:underline"
                      >
                        {c.name}
                      </Link>
                      {c.phone && (
                        <p className="text-xs text-muted-foreground">{c.phone}</p>
                      )}
                      {c.address && (
                        <p className="text-xs text-muted-foreground">{c.address}</p>
                      )}
                    </td>
                    <td className="px-4 py-2 text-right">
                      ₹{c.total_sales.toFixed(2)}
                    </td>
                    <td className="px-4 py-2 text-right text-emerald-700">
                      ₹{c.total_paid.toFixed(2)}
                    </td>
                    <td
                      className={`px-4 py-2 text-right font-bold ${
                        c.balance > 0 ? "text-destructive" : "text-emerald-700"
                      }`}
                    >
                      ₹{Math.abs(c.balance).toFixed(2)}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <div className="flex justify-center gap-2 flex-wrap">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => openModalForEdit(c)}
                        >
                          {lang === "hi" ? "संपादित करें" : "Edit"}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setPaymentCustomer(c);
                            setIsPaymentOpen(true);
                          }}
                        >
                          {lang === "hi" ? "भुगतान लें" : "Take payment"}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default CustomersPage;
