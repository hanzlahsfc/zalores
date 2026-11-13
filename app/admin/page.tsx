"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/format";
import { fmtDate, supabase, type OrderRow, type ProductRow } from "@/lib/supabase";

export default function AdminDashboard() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [lowStock, setLowStock] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) return;
    (async () => {
      const [{ data: o }, { data: p }] = await Promise.all([
        supabase.from("zl_orders").select("*").order("created_at", { ascending: false }).limit(200),
        supabase.from("zl_products").select("*").lte("stock", 10).order("stock"),
      ]);
      setOrders((o ?? []) as OrderRow[]);
      setLowStock((p ?? []) as ProductRow[]);
      setLoading(false);
    })();
  }, []);

  const today = new Date().toDateString();
  const todayOrders = orders.filter((o) => new Date(o.created_at).toDateString() === today);
  const revenue = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((a, o) => a + Number(o.total), 0);
  const pending = orders.filter((o) => o.status === "pending").length;
  const codUnpaid = orders.filter((o) => o.payment_method === "cod" && o.payment_status === "unpaid" && o.status !== "cancelled").length;

  if (loading) return <div className="adm-splash">Loading dashboard…</div>;

  return (
    <>
      <h1>Dashboard</h1>
      <p className="adm-sub">Store performance at a glance</p>

      <div className="adm-kpis">
        <div className="adm-kpi">
          <small>Revenue (all time)</small>
          <strong>{formatPrice(revenue)}</strong>
        </div>
        <div className="adm-kpi">
          <small>Orders today</small>
          <strong>{todayOrders.length}</strong>
        </div>
        <div className="adm-kpi">
          <small>Pending orders</small>
          <strong>{pending}</strong>
        </div>
        <div className="adm-kpi">
          <small>COD to collect</small>
          <strong>{codUnpaid}</strong>
        </div>
      </div>

      <div className="adm-card">
        <h2>Recent orders</h2>
        {orders.length === 0 ? (
          <p className="adm-empty">No orders yet.</p>
        ) : (
          <table className="adm-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Payment</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 8).map((o) => (
                <tr key={o.id}>
                  <td>
                    <Link href={`/admin/order/?id=${o.id}`}>{o.order_number}</Link>
                  </td>
                  <td>{fmtDate(o.created_at)}</td>
                  <td>{o.customer_name || o.email}</td>
                  <td>{o.payment_method === "cod" ? "COD" : o.payment_method}</td>
                  <td>{formatPrice(o.total)}</td>
                  <td>
                    <span className={`adm-badge adm-badge--${o.status}`}>{o.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {lowStock.length > 0 && (
        <div className="adm-card">
          <h2>Low stock</h2>
          <table className="adm-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Stock</th>
              </tr>
            </thead>
            <tbody>
              {lowStock.map((p) => (
                <tr key={p.slug}>
                  <td>{p.name}</td>
                  <td className="adm-muted">{p.sku}</td>
                  <td>
                    <span className="adm-badge adm-badge--pending">{p.stock} left</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
