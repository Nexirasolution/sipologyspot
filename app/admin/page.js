"use client";

import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import SalesReportGenerator from "@/components/admin/SalesReportGenerator";

function StatCard({ label, value, sub, accent }) {
  return (
    <div className="rounded-xl2 border border-gold/15 bg-white p-5 shadow-card">
      <p className="text-xs font-medium text-muted">{label}</p>
      <p className={`mt-2 font-display text-2xl font-bold ${accent || "text-forest"}`}>{value}</p>
      <p className="mt-1 text-xs text-muted">{sub}</p>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-muted">Loading dashboard...</p>;
  if (!data) return <p className="text-terracotta">Failed to load dashboard.</p>;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-forest">Dashboard</h1>
      <p className="mt-1 text-sm text-muted">Welcome back — here&rsquo;s how Sipology Spot is doing.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Today's Sales" value={`₹${data.todaySales}`} sub={`${data.todayOrderCount} orders`} />
        <StatCard label="Weekly Sales" value={`₹${data.weekSales}`} sub={`${data.weekOrderCount} orders`} />
        <StatCard label="Monthly Sales" value={`₹${data.monthSales}`} sub={`${data.monthOrderCount} orders`} accent="text-gold-dark" />
        <StatCard label="Pending Orders" value={data.pendingOrders} sub="Need action" accent="text-terracotta" />
      </div>

      <div className="mt-6 rounded-xl2 border border-gold/15 bg-white p-6 shadow-card">
        <h2 className="font-display text-base font-bold text-forest">Sales Trend (Last 14 Days)</h2>
        <div className="mt-4 h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.salesTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EFE6D2" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#6E6656" />
              <YAxis tick={{ fontSize: 11 }} stroke="#6E6656" />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: "1px solid #EFE6D2", fontSize: 12 }}
                formatter={(value) => [`₹${value}`, "Sales"]}
              />
              <Line type="monotone" dataKey="total" stroke="#B8923F" strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl2 border border-gold/15 bg-white p-6 shadow-card">
          <h2 className="font-display text-base font-bold text-forest">Top Selling Products</h2>
          <div className="mt-4 space-y-3">
            {data.topSelling.length === 0 && <p className="text-sm text-muted">No sales yet.</p>}
            {data.topSelling.map((p) => (
              <div key={p.name} className="flex items-center justify-between text-sm">
                <span className="text-ink/80">{p.name}</span>
                <span className="font-semibold text-forest">{p.qty} sold</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl2 border border-gold/15 bg-white p-6 shadow-card">
          <h2 className="font-display text-base font-bold text-forest">Low Stock Alert</h2>
          <div className="mt-4 space-y-3">
            {data.lowStock.length === 0 && <p className="text-sm text-muted">All products are well stocked.</p>}
            {data.lowStock.map((p) => (
              <div key={p._id} className="flex items-center justify-between text-sm">
                <span className="text-ink/80">{p.name}</span>
                <span className="font-semibold text-terracotta">{p.stock} left</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-2">
        <StatCard label="Total Products" value={data.totalProducts} sub="Across all categories" />
        <StatCard label="Total Categories" value={data.totalCategories} sub="Active collections" />
      </div>

      <div className="mt-6">
        <SalesReportGenerator />
      </div>
    </div>
  );
}