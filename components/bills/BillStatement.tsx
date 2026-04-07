"use client";

import React from "react";

export type BillLine = {
  date: string;
  kind: string;
  detail: string;
  debit: number;
  credit: number;
};

export type BillStatementProps = {
  dairyName: string;
  tagline?: string | null;
  address?: string | null;
  phone?: string | null;
  gst?: string | null;
  customerName: string;
  periodLabel: string;
  lines: BillLine[];
  openingBalance: number;
  totalSales: number;
  totalPaid: number;
  finalBalance: number;
};

export default function BillStatement({
  dairyName,
  tagline,
  address,
  phone,
  gst,
  customerName,
  periodLabel,
  lines,
  openingBalance,
  totalSales,
  totalPaid,
  finalBalance,
}: BillStatementProps) {
  return (
    <div className="bill-print rounded-2xl overflow-hidden border-2 border-primary/25 shadow-lift bg-gradient-to-br from-cream-50 via-white to-sky-wash/30 print:shadow-none print:border-primary/40">
      <div className="bg-gradient-to-r from-primary to-primary-muted px-6 py-5 text-primary-foreground">
        <h2 className="text-2xl font-bold tracking-tight">{dairyName}</h2>
        {tagline && <p className="text-sm opacity-90 mt-1">{tagline}</p>}
        <div className="text-xs opacity-85 mt-3 space-y-0.5">
          {address && <p>{address}</p>}
          <p>
            {[phone && `Phone: ${phone}`, gst && `GST: ${gst}`]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
      </div>

      <div className="px-6 py-5 border-b border-border bg-white/60">
        <p className="text-sm text-muted-foreground">Bill to</p>
        <p className="text-xl font-semibold text-foreground">{customerName}</p>
        <p className="text-sm text-primary font-medium mt-2">Period: {periodLabel}</p>
      </div>

      <div className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-primary border-b border-border">
                <th className="pb-2 pr-2">Date</th>
                <th className="pb-2 pr-2">Type</th>
                <th className="pb-2 pr-2">Detail</th>
                <th className="pb-2 pr-2 text-right">Debit</th>
                <th className="pb-2 text-right">Credit</th>
              </tr>
            </thead>
            <tbody>
              {lines.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted-foreground">
                    No entries in this period.
                  </td>
                </tr>
              ) : (
                lines.map((line, i) => (
                  <tr
                    key={i}
                    className="border-b border-cream-200/80 hover:bg-cream-50/50 transition-colors"
                  >
                    <td className="py-2.5 pr-2 whitespace-nowrap">{line.date}</td>
                    <td className="py-2.5 pr-2 capitalize">{line.kind}</td>
                    <td className="py-2.5 pr-2 text-muted-foreground">{line.detail}</td>
                    <td className="py-2.5 pr-2 text-right font-medium text-foreground">
                      {line.debit > 0 ? `₹${line.debit.toFixed(2)}` : "—"}
                    </td>
                    <td className="py-2.5 text-right font-medium text-primary-muted">
                      {line.credit > 0 ? `₹${line.credit.toFixed(2)}` : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-8 grid sm:grid-cols-3 gap-4">
          <div className="rounded-xl bg-sky-50/90 border border-sky-200/70 p-4 text-center">
            <p className="text-xs text-sky-900/70 uppercase tracking-wide">
              Previous balance
            </p>
            <p className={`text-2xl font-bold mt-1 ${openingBalance > 0 ? "text-destructive" : "text-emerald-700"}`}>
              ₹{Math.abs(openingBalance).toFixed(2)}
              {openingBalance > 0 ? " due" : openingBalance < 0 ? " advance" : ""}
            </p>
          </div>
          <div className="rounded-xl bg-cream-100/80 border border-border p-4 text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Total sales
            </p>
            <p className="text-2xl font-bold text-foreground mt-1">
              ₹{totalSales.toFixed(2)}
            </p>
          </div>
          <div className="rounded-xl bg-emerald-50/90 border border-emerald-200/60 p-4 text-center">
            <p className="text-xs text-emerald-800/80 uppercase tracking-wide">
              Paid
            </p>
            <p className="text-2xl font-bold text-emerald-800 mt-1">
              ₹{totalPaid.toFixed(2)}
            </p>
          </div>
          <div className="rounded-xl bg-amber-50/90 border border-amber-200/70 p-4 text-center">
            <p className="text-xs text-amber-900/70 uppercase tracking-wide">
              Net payable
            </p>
            <p
              className={`text-2xl font-bold mt-1 ${
                finalBalance > 0 ? "text-destructive" : "text-emerald-700"
              }`}
            >
              ₹{Math.abs(finalBalance).toFixed(2)}
              {finalBalance > 0 ? " due" : finalBalance < 0 ? " advance" : ""}
            </p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          Total sales + previous balance - payments/advance = net payable
        </p>
      </div>
    </div>
  );
}
