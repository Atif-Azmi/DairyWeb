import React from "react";
import Card from "@/components/ui/Card";

export interface AnalyticsDashboardData {
  totalSales: number;
  totalMilk: number;
  totalGheeKg?: number;
  totalPaid: number;
  outstandingBalance: number;
  productSales?: { milk: number; ghee: number };
  dailySales?: Record<string, number>;
  topCustomers?: { name: string; total_purchase: number }[];
}

interface Props {
  data: AnalyticsDashboardData;
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <Card title={title}>
      <p className="text-2xl md:text-3xl font-bold text-foreground">{value}</p>
    </Card>
  );
}

const AnalyticsDashboard: React.FC<Props> = ({ data }) => {
  const daily = data.dailySales
    ? Object.entries(data.dailySales).sort(([a], [b]) => a.localeCompare(b))
    : [];
  const maxDay = Math.max(1, ...daily.map(([, v]) => v));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total sales" value={`₹${data.totalSales.toFixed(2)}`} />
        <StatCard
          title="Milk (liters)"
          value={data.totalMilk.toFixed(2)}
        />
        {(data.totalGheeKg ?? 0) > 0 && (
          <StatCard title="Ghee (kg)" value={(data.totalGheeKg ?? 0).toFixed(2)} />
        )}
        <StatCard
          title="Payments received"
          value={`₹${data.totalPaid.toFixed(2)}`}
        />
        <StatCard
          title="Outstanding"
          value={`₹${data.outstandingBalance.toFixed(2)}`}
        />
      </div>

      {data.productSales && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card title="Sales — Milk">
            <p className="text-xl font-semibold text-primary">
              ₹{data.productSales.milk.toFixed(2)}
            </p>
          </Card>
          <Card title="Sales — Ghee">
            <p className="text-xl font-semibold text-primary">
              ₹{data.productSales.ghee.toFixed(2)}
            </p>
          </Card>
        </div>
      )}

      {daily.length > 0 && (
        <Card title="Daily sales trend">
          <div className="flex items-end gap-1 h-36 pt-2">
            {daily.map(([date, amount]) => (
              <div
                key={date}
                className="flex-1 flex flex-col items-center gap-1 min-w-0"
                title={`${date}: ₹${amount.toFixed(2)}`}
              >
                <div
                  className="w-full max-w-[28px] mx-auto rounded-t-md bg-gradient-to-t from-primary to-primary-muted transition-all hover:opacity-90"
                  style={{ height: `${(amount / maxDay) * 100}%`, minHeight: amount > 0 ? 4 : 0 }}
                />
                <span className="text-[9px] text-muted-foreground truncate w-full text-center">
                  {date.slice(5)}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {data.topCustomers && data.topCustomers.length > 0 && (
        <Card title="Top customers (period)">
          <ul className="space-y-2">
            {data.topCustomers.map((c) => (
              <li
                key={c.name}
                className="flex justify-between items-center border-b border-border/60 pb-2 last:border-0"
              >
                <span className="text-foreground">{c.name}</span>
                <span className="font-semibold text-primary">
                  ₹{c.total_purchase.toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
