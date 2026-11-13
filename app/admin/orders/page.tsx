"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { formatPrice } from "@/lib/format";
import { useOrdersRealtime } from "@/lib/useOrdersRealtime";
import {
  fmtDate,
  ORDER_STATUSES,
  PAYMENT_LABELS,
  supabase,
  type OrderRow,
} from "@/lib/supabase";

function AdminOrders() {
  const router = useRouter();
  const params = useSearchParams();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [status, setStatus] = useState<string>("all");
  const [q, setQ] = useState(params.get("q") ?? "");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");

  useOrdersRealtime({
    insert: (o) => {
      setOrders((prev) => (prev.some((x) => x.id === o.id) ? prev : [o, ...prev]));
      setToast(`New order ${o.order_number} · ${formatPrice(o.total)}`);
      setTimeout(() => setToast(""), 8000);
    },
    update: (o) => setOrders((prev) => prev.map((x) => (x.id === o.id ? o : x))),
    remove: (id) => setOrders((prev) => prev.filter((x) => x.id !== id)),
  });

  useEffect(() => {
    if (!supabase) return;
    supabase
      .from("zl_orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500)
      .then(({ data }) => {
        setOrders((data ?? []) as OrderRow[]);
        setLoading(false);
      });
  }, []);

  const filtered = useMemo(
    () =>
      orders.filter(
        (o) =>
          (status === "all" || o.status === status) &&
          (!q ||
            o.order_number.toLowerCase().includes(q.toLowerCase()) ||
            (o.phone ?? "").includes(q) ||
            o.email.toLowerCase().includes(q.toLowerCase()) ||
            (o.customer_name ?? "").toLowerCase().includes(q.toLowerCase())),
      ),
    [orders, status, q],
  );

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: orders.length };
    for (const s of ORDER_STATUSES) c[s] = orders.filter((o) => o.status === s).length;
    return c;
  }, [orders]);

  if (loading) return <div className="adm-splash">Loading orders…</div>;

  return (
    <div className="adm-page adm-page--wide">
      <div className="adm-head">
        <h1>Orders</h1>
        <span className="adm-muted">{orders.length} total</span>
      </div>

      <div className="adm-card adm-card--flush">
        <div className="adm-tabs">
          {["all", ...ORDER_STATUSES].map((s) => (
            <button key={s} type="button" className={`adm-tab${status === s ? " active" : ""}`} onClick={() => setStatus(s)}>
              {s[0].toUpperCase() + s.slice(1)}
              {counts[s] ? ` (${counts[s]})` : ""}
            </button>
          ))}
        </div>
        <div className="adm-filterbar">
          <input className="adm-search" placeholder="Search by order #, customer, email or phone" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        {filtered.length === 0 ? (
          <div className="adm-empty">
            <h3>{orders.length ? "No orders found" : "Your orders will show here"}</h3>
            <p>{orders.length ? "Try changing the filters or search term." : "New orders appear here in real time."}</p>
          </div>
        ) : (
          <table className="adm-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Date</th>
                <th>Customer</th>
                <th>City</th>
                <th>Total</th>
                <th>Payment status</th>
                <th>Fulfillment</th>
                <th>Payment</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr key={o.id} className="clickable" onClick={() => router.push(`/admin/order/?id=${o.id}`)}>
                  <td>
                    <strong>{o.order_number}</strong>
                  </td>
                  <td className="adm-muted">{fmtDate(o.created_at)}</td>
                  <td>{o.customer_name || o.email}</td>
                  <td className="adm-muted">{o.address?.city ?? ""}</td>
                  <td>{formatPrice(o.total)}</td>
                  <td>
                    <span className={`adm-badge adm-badge--${o.payment_status}`}>{o.payment_status === "paid" ? "Paid" : "Payment pending"}</span>
                  </td>
                  <td>
                    <span className={`adm-badge adm-badge--${o.status}`}>{o.status}</span>
                  </td>
                  <td className="adm-muted">{PAYMENT_LABELS[o.payment_method] ?? o.payment_method}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {toast && <div className="adm-toast">{toast}</div>}
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="adm-splash">Loading orders…</div>}>
      <AdminOrders />
    </Suspense>
  );
}
