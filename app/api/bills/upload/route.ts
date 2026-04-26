import { NextRequest } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import { getAuthenticatedSupabase } from "@/lib/auth-api";
import { json } from "@/lib/http";
import {
  BillPdfDocument,
  type BillPdfLine,
} from "@/components/bills/BillPdfDocument";

export async function POST(req: NextRequest) {
  const auth = await getAuthenticatedSupabase();
  if (!auth.ok) return auth.response;

  const { customer_id, start_date, end_date } = await req.json();
  if (!customer_id || !start_date || !end_date) {
    return json(
      { error: "customer_id, start_date, and end_date are required" },
      { status: 400 }
    );
  }

  const { data: profile } = await auth.supabase
    .from("dairy_profile")
    .select("*")
    .eq("id", 1)
    .maybeSingle();

  const { data: customer, error: cErr } = await auth.supabase
    .from("dairy_customers" as any)
    .select("name")
    .eq("id", customer_id)
    .single() as { data: any | null; error: any };

  if (cErr || !customer) {
    return json({ error: "Customer not found" }, { status: 404 });
  }

  const { data: entries, error: eErr } = await auth.supabase
    .from("entries")
    .select("date, shift, quantity, price_per_unit, total_amount, products(name)")
    .eq("customer_id", customer_id)
    .gte("date", start_date)
    .lte("date", end_date)
    .order("date", { ascending: true });

  if (eErr) {
    return json({ error: eErr.message }, { status: 500 });
  }

  const { data: prevEntries, error: peErr } = await auth.supabase
    .from("entries")
    .select("total_amount")
    .eq("customer_id", customer_id)
    .lt("date", start_date);
  if (peErr) {
    return json({ error: peErr.message }, { status: 500 });
  }

  const { data: transactions, error: tErr } = await auth.supabase
    .from("transactions")
    .select("date, type, amount, payment_mode, note")
    .eq("customer_id", customer_id)
    .gte("date", start_date)
    .lte("date", end_date)
    .order("date", { ascending: true });

  if (tErr) {
    return json({ error: tErr.message }, { status: 500 });
  }

  const { data: prevTransactions, error: ptErr } = await auth.supabase
    .from("transactions")
    .select("amount")
    .eq("customer_id", customer_id)
    .lt("date", start_date);
  if (ptErr) {
    return json({ error: ptErr.message }, { status: 500 });
  }

  const lines: BillPdfLine[] = [];

  for (const e of entries || []) {
    const p = e.products as { name?: string } | null;
    const name = p?.name ?? "product";
    lines.push({
      date: String(e.date),
      kind: "Sale",
      detail: `${e.shift} · ${Number(e.quantity)} ${name} @ ₹${Number(e.price_per_unit).toFixed(2)}`,
      debit: Number(e.total_amount).toFixed(2),
      credit: "—",
    });
  }

  for (const t of transactions || []) {
    lines.push({
      date: String(t.date),
      kind: String(t.type),
      detail: `${t.payment_mode}${t.note ? ` · ${t.note}` : ""}`,
      debit: "—",
      credit: Number(t.amount).toFixed(2),
    });
  }

  lines.sort((a, b) => a.date.localeCompare(b.date));

  let totalSales = 0;
  let totalPaid = 0;
  let prevSales = 0;
  let prevPaid = 0;
  for (const e of prevEntries || []) {
    prevSales += Number(e.total_amount || 0);
  }
  for (const t of prevTransactions || []) {
    prevPaid += Number(t.amount || 0);
  }
  for (const e of entries || []) {
    totalSales += Number(e.total_amount || 0);
  }
  for (const t of transactions || []) {
    totalPaid += Number(t.amount || 0);
  }
  const openingBalance = prevSales - prevPaid;
  const finalBalance = openingBalance + totalSales - totalPaid;

  const dairyName = profile?.dairy_name ?? "Dairy";

  const buffer = await renderToBuffer(
    React.createElement(BillPdfDocument, {
      dairyName,
      tagline: profile?.tagline,
      address: profile?.address,
      phone: profile?.phone,
      gst: profile?.gst,
      customerName: customer.name,
      periodLabel: `${start_date} → ${end_date}`,
      lines,
      openingBalance: openingBalance.toFixed(2),
      totalSales: totalSales.toFixed(2),
      totalPaid: totalPaid.toFixed(2),
      finalBalance: finalBalance.toFixed(2),
    }) as React.ReactElement<import("@react-pdf/renderer").DocumentProps>
  );

  const bucket = process.env.BILLS_BUCKET || "bills";
  const today = new Date().toISOString().slice(0, 10);
  const path = `projects/dairy/${today}/bills/${customer_id}/${start_date}_${end_date}.pdf`;

  const { error: upErr } = await auth.supabase.storage
    .from(bucket)
    .upload(path, buffer, {
      contentType: "application/pdf",
      upsert: true,
    });

  if (upErr) {
    return json({ error: upErr.message }, { status: 500 });
  }

  const { data: signed, error: signErr } = await auth.supabase.storage
    .from(bucket)
    .createSignedUrl(path, 60 * 60 * 24 * 7);

  if (signErr || !signed?.signedUrl) {
    return json(
      { error: signErr?.message ?? "Could not sign URL" },
      { status: 500 }
    );
  }

  // Shorten the signed URL using TinyURL to keep WhatsApp messages clean
  let shortUrl = null;
  try {
    const tinyRes = await fetch('https://tinyurl.com/api-create.php?url=' + encodeURIComponent(signed.signedUrl));
    if (tinyRes.ok) {
      shortUrl = await tinyRes.text();
    }
  } catch (err) {
    console.error("TinyURL error:", err);
  }

  return json({
    signedUrl: signed.signedUrl,
    shortUrl: shortUrl,
    path,
    bucket,
    expiresInSeconds: 60 * 60 * 24 * 7,
  });
}
