import React, { useState } from "react";
import { supabaseClient } from "@/lib/supabaseClient";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { useI18n } from "@/components/i18n/LanguageProvider";

interface TransactionFormProps {
  customerId: string;
  onSuccess: () => void;
  defaultType?: "payment" | "advance" | "adjustment";
  lockType?: boolean;
}

const TransactionForm: React.FC<TransactionFormProps> = ({
  customerId,
  onSuccess,
  defaultType,
  lockType,
}) => {
  const { t, lang } = useI18n();
  const [type, setType] = useState<"payment" | "advance" | "adjustment">(
    defaultType ?? "payment"
  );
  const [amount, setAmount] = useState("");
  type PaymentMode = "cash" | "online" | "upi";
  const [paymentMode, setPaymentMode] = useState<PaymentMode>("cash");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (defaultType) setType(defaultType);
  }, [defaultType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      setError("Please enter a valid amount.");
      return;
    }
    setIsSubmitting(true);
    setError(null);

    try {
      const { error: submissionError } = await supabaseClient
        .from("transactions")
        .insert([
          {
            customer_id: customerId,
            type,
            amount: Number(amount),
            payment_mode: paymentMode,
            date,
            note: note.trim() ? note.trim() : null,
          },
        ]);

      if (submissionError) {
        setError(`Failed to save transaction: ${submissionError.message}`);
      } else {
        setAmount("");
        setNote("");
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
          label={t("form.amount")}
          id="amount"
          type="number"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
        <Select
          label={t("tx.type")}
          value={type}
          onChange={(v) => setType(v as "payment" | "advance" | "adjustment")}
          options={[
            { value: "payment", label: t("tx.payment") },
            { value: "advance", label: t("tx.advance") },
            { value: "adjustment", label: t("tx.adjustment") },
          ]}
          disabled={!!lockType}
          required
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label={t("tx.paymentMode")}
          value={paymentMode}
          onChange={(v) =>
            setPaymentMode(v === "online" ? "online" : v === "upi" ? "upi" : "cash")
          }
          options={[
            { value: "cash", label: t("tx.cash") },
            { value: "online", label: t("tx.online") },
            { value: "upi", label: t("tx.upi") },
          ]}
        />
        <Input
          label={t("form.date")}
          id="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </div>
      <Input
        label={t("form.noteOptional")}
        id="note"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? t("common.saving") : lang === "hi" ? "लेनदेन सेव करें" : "Save Transaction"}
        </Button>
      </div>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </form>
  );
};

export default TransactionForm;
