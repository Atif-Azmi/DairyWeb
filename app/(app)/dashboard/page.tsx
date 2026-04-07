"use client";

import React, { useState, useEffect, useCallback } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import AnalyticsDashboard, {
  type AnalyticsDashboardData,
} from "@/components/analytics/AnalyticsDashboard";
import { withTimeout } from "@/lib/withTimeout";
import { useI18n } from "@/components/i18n/LanguageProvider";

const FETCH_MS = 18_000;

const emptyAnalytics = (): AnalyticsDashboardData => ({
  totalSales: 0,
  totalMilk: 0,
  totalGheeKg: 0,
  totalPaid: 0,
  outstandingBalance: 0,
  productSales: { milk: 0, ghee: 0 },
  dailySales: {},
  topCustomers: [],
});

const getDateRange = (filter: string) => {
  const today = new Date();
  let startDate = new Date();
  let endDate = new Date();

  switch (filter) {
    case "today":
      break;
    case "week": {
      const d = today.getDay();
      const mondayOffset = d === 0 ? -6 : 1 - d;
      startDate = new Date(today);
      startDate.setDate(today.getDate() + mondayOffset);
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      break;
    }
    case "month":
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      break;
  }
  return {
    start: startDate.toISOString().slice(0, 10),
    end: endDate.toISOString().slice(0, 10),
  };
};

const DashboardPage = () => {
  const { t, lang } = useI18n();
  const [data, setData] = useState<AnalyticsDashboardData>(emptyAnalytics);
  const [filter, setFilter] = useState("today");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async (currentFilter: string, customStart?: string, customEnd?: string) => {
    setError(null);
    const range =
      currentFilter === "custom" && customStart && customEnd
        ? { start: customStart, end: customEnd }
        : getDateRange(currentFilter);
    try {
      const res = await withTimeout(
        fetch(
          `/api/analytics?start_date=${encodeURIComponent(range.start)}&end_date=${encodeURIComponent(range.end)}`,
          { credentials: "include" }
        ),
        FETCH_MS
      );
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setError((j as { error?: string }).error ?? "Failed to load analytics");
        setData(emptyAnalytics());
        return;
      }
      const json = await res.json();
      setData({
        totalSales: Number(json.totalSales),
        totalMilk: Number(json.totalMilk),
        totalGheeKg: Number(json.totalGheeKg),
        totalPaid: Number(json.totalPaid),
        outstandingBalance: Number(json.outstandingBalance),
        productSales: json.productSales,
        dailySales: json.dailySales,
        topCustomers: json.topCustomers,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load analytics");
      setData(emptyAnalytics());
    }
  }, []);

  useEffect(() => {
    if (filter === "custom") {
      if (startDate && endDate) {
        fetchAnalytics(filter, startDate, endDate);
      }
      return;
    }
    fetchAnalytics(filter);
  }, [filter, startDate, endDate, fetchAnalytics]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-foreground">{t("dashboard.title")}</h1>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant={filter === "today" ? "primary" : "outline"}
            onClick={() => setFilter("today")}
          >
            {lang === "hi" ? "आज" : "Today"}
          </Button>
          <Button
            type="button"
            variant={filter === "week" ? "primary" : "outline"}
            onClick={() => setFilter("week")}
          >
            {lang === "hi" ? "यह सप्ताह" : "This week"}
          </Button>
          <Button
            type="button"
            variant={filter === "month" ? "primary" : "outline"}
            onClick={() => setFilter("month")}
          >
            {lang === "hi" ? "यह महीना" : "This month"}
          </Button>
          <Button
            type="button"
            variant={filter === "custom" ? "primary" : "outline"}
            onClick={() => setFilter("custom")}
          >
            {lang === "hi" ? "कस्टम" : "Custom"}
          </Button>
        </div>
      </div>
      {filter === "custom" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-2xl">
          <Input
            id="analytics-start"
            label={lang === "hi" ? "शुरू तारीख" : "Start Date"}
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
          <Input
            id="analytics-end"
            label={lang === "hi" ? "अंतिम तारीख" : "End Date"}
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
          />
          <div className="flex items-end">
            <Button
              type="button"
              onClick={() => fetchAnalytics("custom", startDate, endDate)}
              disabled={!startDate || !endDate}
            >
              {lang === "hi" ? "लागू करें" : "Apply"}
            </Button>
          </div>
        </div>
      )}

      {error ? (
        <p className="text-destructive">{error}</p>
      ) : (
        <div className="space-y-4">
          {data.totalSales === 0 &&
            data.totalPaid === 0 &&
            Object.keys(data.dailySales ?? {}).length === 0 && (
              <p className="text-sm text-muted-foreground rounded-lg border border-border bg-secondary/30 px-4 py-3">
                No sales or payments in this period yet. Add daily entries or payments to see
                figures here.
              </p>
            )}
          <AnalyticsDashboard data={data} />
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
