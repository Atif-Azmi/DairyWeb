import React, { useMemo, useState } from "react";
import { supabaseClient } from "@/lib/supabaseClient";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useI18n } from "@/components/i18n/LanguageProvider";

interface CustomerFormProps {
  customer: any | null; // Pass null for new customer
  onSuccess: () => void;
}

const CustomerForm: React.FC<CustomerFormProps> = ({ customer, onSuccess }) => {
  const { t, lang } = useI18n();
  const [name, setName] = useState(customer?.name || "");
  const [phone, setPhone] = useState(customer?.phone || "");
  const [address, setAddress] = useState(customer?.address || "");
  const [defaultMilkQty, setDefaultMilkQty] = useState(
    customer?.default_milk_qty || ""
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const normalizedPhone = useMemo(() => phone.replace(/\D/g, ""), [phone]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Customer name is required.");
      return;
    }
    if (normalizedPhone && normalizedPhone.length !== 10) {
      setError(lang === "hi" ? "फोन नंबर ठीक 10 अंकों का होना चाहिए।" : "Phone number must be exactly 10 digits.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      if (normalizedPhone) {
        let existsQuery = supabaseClient
          .from("customers")
          .select("id, name, phone")
          .eq("phone", normalizedPhone)
          .limit(1);
        if (customer?.id) {
          existsQuery = existsQuery.neq("id", customer.id);
        }
        const { data: existing } = await existsQuery.maybeSingle();
        if (existing) {
          setError(`Phone already exists for customer "${existing.name}".`);
          return;
        }
      }

      const customerData = {
        name: name.trim(),
        phone: normalizedPhone || null,
        address,
        default_milk_qty: Number(defaultMilkQty) || null,
      };

      const { error: submissionError } = customer?.id
        ? await supabaseClient
            .from("customers")
            .update(customerData)
            .eq("id", customer.id)
        : await supabaseClient.from("customers").insert([customerData]);

      if (submissionError) {
        console.error("Error saving customer:", submissionError);
        setError(submissionError.message || "Failed to save customer. Please try again.");
      } else {
        if (!customer?.id) {
          setName("");
          setPhone("");
          setAddress("");
          setDefaultMilkQty("");
        }
        onSuccess();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label={t("form.fullName")}
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={isSubmitting}
        />
        <Input
          label={t("form.phone")}
          id="phone"
          type="tel"
          value={phone}
          onChange={(e) => {
            const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
            setPhone(digits);
          }}
          inputMode="numeric"
          pattern="[0-9]{10}"
          placeholder={lang === "hi" ? "10 अंकों का नंबर" : "10-digit number"}
          disabled={isSubmitting}
        />
      </div>
      <Input
        label={t("form.address")}
        id="address"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        disabled={isSubmitting}
      />
      <Input
        label={t("form.defaultMilkQty")}
        id="defaultMilkQty"
        type="number"
        step="0.1"
        value={defaultMilkQty}
        onChange={(e) => setDefaultMilkQty(e.target.value)}
        disabled={isSubmitting}
      />
      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? t("common.saving") : (lang === "hi" ? "ग्राहक सेव करें" : "Save Customer")}
        </Button>
      </div>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </form>
  );
};

export default CustomerForm;
