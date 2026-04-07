import React, { useState, useEffect } from "react";
import { supabaseClient } from "@/lib/supabaseClient";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { useI18n } from "@/components/i18n/LanguageProvider";

type EntryFormProps = {
  customers: { id: string; name: string }[];
  products: { id: number; name: string; default_rate?: number; rate?: number }[];
  entry?: Record<string, unknown> | null;
  onSuccess: () => void;
};

const EntryForm = ({
  customers,
  products,
  entry = null,
  onSuccess,
}: EntryFormProps) => {
  const { t, lang } = useI18n();
  const [customerId, setCustomerId] = useState("");
  const [productId, setProductId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [shift, setShift] = useState("morning");
  const [quantity, setQuantity] = useState("");
  const [pricePerUnit, setPricePerUnit] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const cid = entry?.customer_id;
    setCustomerId(
      (typeof cid === "string" ? cid : "") ||
        (customers.length === 1 ? customers[0].id : "")
    );
    const pid = entry?.product_id;
    setProductId(pid != null ? String(pid) : "");
    const d = entry?.date;
    setDate(typeof d === "string" ? d : new Date().toISOString().slice(0, 10));
    const sh = entry?.shift;
    setShift(typeof sh === "string" ? sh : "morning");
    const q = entry?.quantity;
    setQuantity(q != null ? String(q) : "");
    const ppu = entry?.price_per_unit;
    setPricePerUnit(ppu != null ? String(ppu) : "");
  }, [entry, customers]);

  useEffect(() => {
    if (!entry) {
      // Only auto-fill for new entries
      const selectedProduct = products.find(
        (p) => p.id.toString() === productId
      );
      if (selectedProduct) {
        const rate =
          selectedProduct.default_rate ?? selectedProduct.rate ?? 0;
        setPricePerUnit(String(rate));
      }
    }
  }, [productId, products, entry]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);
    const payload = {
      customer_id: customerId,
      product_id: Number(productId),
      date,
      shift,
      quantity: Number(quantity),
      price_per_unit: Number(pricePerUnit),
    };
    const { error } = entry
      ? await supabaseClient.from("entries").update(payload).eq("id", entry.id)
      : await supabaseClient.from("entries").insert([payload]);
    if (error) {
      setError(error.message);
    } else {
      setSuccess(entry ? "Entry updated." : "Entry added.");
      if (!entry) {
        setQuantity("");
        setSuccess("Entry added. You can add another.");
      }
      onSuccess();
    }
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Select
        label={t("form.customer")}
        value={customerId}
        onChange={setCustomerId}
        options={customers.map((c) => ({ value: c.id, label: c.name }))}
        required
        disabled={!!entry}
      />
      <Select
        label={t("form.product")}
        value={productId}
        onChange={setProductId}
        options={products.map((p) => ({
          value: p.id.toString(),
          label: p.name,
        }))}
        required
      />
      <Input
        id="entry-qty"
        label={t("form.quantity")}
        type="number"
        step="0.1"
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
        required
      />
      <Input
        id="entry-price"
        label={t("form.pricePerUnit")}
        type="number"
        step="0.01"
        value={pricePerUnit}
        onChange={(e) => setPricePerUnit(e.target.value)}
        required
      />
      <Input
        id="entry-date"
        label={t("form.date")}
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        required
      />
      <Select
        label={t("form.shift")}
        value={shift}
        onChange={setShift}
        options={[
          { value: "morning", label: t("form.morning") },
          { value: "evening", label: t("form.evening") },
        ]}
        required
      />
      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? t("common.saving") : lang === "hi" ? "एंट्री सेव करें" : "Save Entry"}
        </Button>
      </div>
      {error && (
        <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
          {error}
        </p>
      )}
      {success && (
        <p className="text-sm text-emerald-700 bg-emerald-50 rounded-md px-3 py-2">
          {success}
        </p>
      )}
    </form>
  );
};

export default EntryForm;
