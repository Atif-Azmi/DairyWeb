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
    padding: 10,
    fontFamily: "Helvetica",
    color: "#1a2e1a",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: "100%",
    height: "100%",
  },
  tile: {
    width: "50%",
    height: "50%",
    padding: 15,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderStyle: "dashed",
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: "#2d6a4f",
    paddingBottom: 6,
    marginBottom: 8,
  },
  brand: { fontSize: 12, fontWeight: "bold", color: "#1b4332" },
  tagline: { fontSize: 7, color: "#52796f", marginTop: 2 },
  meta: { fontSize: 7, color: "#344e41", marginTop: 4 },
  sectionTitle: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#2d6a4f",
    marginTop: 8,
    marginBottom: 4,
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#d8f3dc",
    paddingVertical: 3,
  },
  cell1: { width: "22%", fontSize: 7 },
  cell2: { width: "18%", fontSize: 7 },
  cell3: { width: "15%", textAlign: "right", fontSize: 7 },
  cell4: { width: "20%", textAlign: "right", fontSize: 7 },
  th: { fontWeight: "bold", color: "#1b4332" },
  totals: {
    marginTop: 10,
    padding: 8,
    backgroundColor: "#f1faee",
    borderRadius: 4,
  },
  totalRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 2 },
  totalLabel: { fontWeight: "bold", fontSize: 7 },
  totalValue: { fontSize: 7 },
  balanceDue: { fontSize: 9, color: "#bc4749", marginTop: 4, fontWeight: "bold" },
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
  billsPerPage?: number;
};

const BillTile = ({
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
  tileStyle,
}: BillPdfProps & { tileStyle: any }) => (
  <View style={tileStyle}>
    <View style={styles.header}>
      <Text style={styles.brand}>{dairyName}</Text>
      {tagline ? <Text style={styles.tagline}>{tagline}</Text> : null}
      {address ? <Text style={styles.meta}>{address}</Text> : null}
      <Text style={styles.meta}>
        {[phone && `Ph: ${phone}`, gst && `GST: ${gst}`]
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
    {lines.slice(0, 15).map((line, i) => (
      <View key={i} style={styles.row}>
        <Text style={styles.cell1}>{line.date}</Text>
        <Text style={styles.cell2}>{line.kind}</Text>
        <Text style={styles.cell1}>{line.detail}</Text>
        <Text style={styles.cell3}>{line.debit}</Text>
        <Text style={styles.cell4}>{line.credit}</Text>
      </View>
    ))}

    <View style={styles.totals}>
      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Prev balance</Text>
        <Text style={styles.totalValue}>₹{openingBalance}</Text>
      </View>
      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Sales (period)</Text>
        <Text style={styles.totalValue}>₹{totalSales}</Text>
      </View>
      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Paid (period)</Text>
        <Text style={styles.totalValue}>₹{totalPaid}</Text>
      </View>
      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Net payable</Text>
        <Text style={styles.balanceDue}>₹{finalBalance}</Text>
      </View>
    </View>
  </View>
);

export function BillPdfDocument(props: BillPdfProps) {
  const count = props.billsPerPage || 4;
  const tiles = Array.from({ length: count });

  const tileStyle = {
    ...styles.tile,
    width: count === 1 ? "100%" : count === 2 ? "100%" : "50%",
    height: count === 1 ? "100%" : count === 2 ? "50%" : "50%",
  };

  return (
    <Document title={`Bill \u2014 ${props.customerName}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.grid}>
          {tiles.map((_, i) => (
            <BillTile key={i} {...props} tileStyle={tileStyle} />
          ))}
        </View>
      </Page>
    </Document>
  );
}
