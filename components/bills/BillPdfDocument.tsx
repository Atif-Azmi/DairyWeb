import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#1a2e1a",
  },
  header: {
    borderBottomWidth: 2,
    borderBottomColor: "#2d6a4f",
    paddingBottom: 12,
    marginBottom: 16,
  },
  brand: { fontSize: 18, fontWeight: "bold", color: "#1b4332" },
  tagline: { fontSize: 9, color: "#52796f", marginTop: 4 },
  meta: { fontSize: 9, color: "#344e41", marginTop: 8 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#2d6a4f",
    marginTop: 14,
    marginBottom: 6,
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#d8f3dc",
    paddingVertical: 5,
  },
  cell1: { width: "22%" },
  cell2: { width: "18%" },
  cell3: { width: "15%", textAlign: "right" },
  cell4: { width: "20%", textAlign: "right" },
  th: { fontWeight: "bold", color: "#1b4332" },
  totals: {
    marginTop: 16,
    padding: 12,
    backgroundColor: "#f1faee",
    borderRadius: 4,
  },
  totalRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  totalLabel: { fontWeight: "bold" },
  balanceDue: { fontSize: 12, color: "#bc4749", marginTop: 6 },
});

export type BillPdfLine = {
  date: string;
  kind: string;
  detail: string;
  debit: string;
  credit: string;
};

export type BillPdfProps = {
  dairyName: string;
  tagline?: string | null;
  address?: string | null;
  phone?: string | null;
  gst?: string | null;
  customerName: string;
  periodLabel: string;
  lines: BillPdfLine[];
  openingBalance: string;
  totalSales: string;
  totalPaid: string;
  finalBalance: string;
};

export function BillPdfDocument({
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
}: BillPdfProps) {
  return (
    <Document title={`Bill — ${customerName}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.brand}>{dairyName}</Text>
          {tagline ? <Text style={styles.tagline}>{tagline}</Text> : null}
          {address ? <Text style={styles.meta}>{address}</Text> : null}
          <Text style={styles.meta}>
            {[phone && `Phone: ${phone}`, gst && `GST: ${gst}`]
              .filter(Boolean)
              .join("  ·  ")}
          </Text>
        </View>
        <Text style={styles.meta}>Bill to: {customerName}</Text>
        <Text style={styles.meta}>Period: {periodLabel}</Text>

        <Text style={styles.sectionTitle}>Statement</Text>
        <View style={styles.row}>
          <Text style={[styles.cell1, styles.th]}>Date</Text>
          <Text style={[styles.cell2, styles.th]}>Type</Text>
          <Text style={[styles.cell1, styles.th]}>Detail</Text>
          <Text style={[styles.cell3, styles.th]}>Debit</Text>
          <Text style={[styles.cell4, styles.th]}>Credit</Text>
        </View>
        {lines.map((line, i) => (
          <View key={i} style={styles.row} wrap={false}>
            <Text style={styles.cell1}>{line.date}</Text>
            <Text style={styles.cell2}>{line.kind}</Text>
            <Text style={styles.cell1}>{line.detail}</Text>
            <Text style={styles.cell3}>{line.debit}</Text>
            <Text style={styles.cell4}>{line.credit}</Text>
          </View>
        ))}

        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Previous balance</Text>
            <Text>₹{openingBalance}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total sales (period)</Text>
            <Text>₹{totalSales}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total paid (period)</Text>
            <Text>₹{totalPaid}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Net payable</Text>
            <Text style={styles.balanceDue}>₹{finalBalance}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
