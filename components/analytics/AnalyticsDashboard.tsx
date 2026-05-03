import React from "react";
import Card from "@/components/ui/Card";

export interface AnalyticsDashboardData {
  totalSales: number;
  totalMilk: number;
  totalPaid: number;
  outstandingBalance: number;
  productSales?: Record<string, number>;
  dailySales?: Record<string, number>;
  topCustomers?: { name: string; total_purchase: number }[];
}

interface Props {
  data: AnalyticsDashboardData;
  isPremium?: boolean;
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <Card title={title}>
      <p className="text-2xl md:text-3xl font-bold text-foreground">{value}</p>
    </Card>
  );
}

const AnalyticsDashboard: React.FC<Props> = ({ data, isPremium }) => {
  const daily = data.dailySales
    ? Object.entries(data.dailySales).sort(([a], [b]) => a.localeCompare(b))
    : [];
  const maxDay = Math.max(1, ...daily.map(([, v]) => v));

  const productEntries = data.productSales ? Object.entries(data.productSales) : [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total sales" value={`₹${data.totalSales.toFixed(2)}`} />
        <StatCard
          title="Milk (liters)"
          value={data.totalMilk.toFixed(2)}
        />
        <StatCard
          title="Payments received"
          value={`₹${data.totalPaid.toFixed(2)}`}
        />
        <StatCard
          title="Outstanding"
          value={`₹${data.outstandingBalance.toFixed(2)}`}
        />
      </div>

      {productEntries.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {productEntries.map(([name, amount]) => (
            <Card key={name} title={`Sales — ${name.charAt(0).toUpperCase() + name.slice(1)}`}>
              <p className="text-xl font-semibold text-primary">
                ₹{amount.toFixed(2)}
              </p>
            </Card>
          ))}
        </div>
      )}

      {isPremium ? (
        <>
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
        </>
      ) : (
        <Card>
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
            <div className="bg-primary/10 p-4 rounded-full text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25-2.25Z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold">Premium Analytics Locked</h3>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                Upgrade to Premium to see daily trends, top customers, and detailed insights.
              </p>
            </div>
            <a 
              href="/subscription"
              className="inline-flex items-center justify-center px-6 py-2 bg-primary text-white rounded-xl text-sm font-bold shadow-lg hover:scale-105 transition-all"
            >
              Upgrade Now
            </a>
          </div>
        </Card>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
