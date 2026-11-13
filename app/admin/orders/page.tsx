"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { formatPrice } from "@/lib/format";
import {
  fmtDate,
  ORDER_STATUSES,
  PAYMENT_LABELS,
  supabase,
  type OrderRow,
} from "@/lib/supabase";

export default function AdminOrders() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [status, setStatus] = useState<string>("all");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

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
    <>
      <h1>Orders</h1>
      <p className="adm-sub">{orders.length} orders total</p>

      <div className="adm-tabs">
        {["all", ...ORDER_STATUSES].map((s) => (
          <button
            key={s}
            type="button"
            className={`adm-tab${status === s ? " active" : ""}`}
            onClick={() => setStatus(s)}
          >
            {s[0].toUpperCase() + s.slice(1)} {counts[s] ? `(${counts[s]})` : ""}
          </button>
        ))}
      </div>

      <input
        className="adm-search"
        placeholder="Search order #, customer or email"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      <div className="adm-card">
        {filtered.length === 0 ? (
          <p className="adm-empty">No orders match.</p>
        ) : (
          <table className="adm-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Date</th>
                <th>Customer</th>
                <th>City</th>
                <th>Payment</th>
                <th>Paid</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr key={o.id}>
                  <td>
                    <Link href={`/admin/order/?id=${o.id}`}>{o.order_number}</Link>
                  </td>
                  <td>{fmtDate(o.created_at)}</td>
                  <td>
                    {o.customer_name || "—"}
                    <br />
                    <span className="adm-muted">{o.email}</span>
                  </td>
                  <td>{o.address?.city ?? "—"}</td>
                  <td>
                    <span className="adm-badge adm-badge--cod">
                      {PAYMENT_LABELS[o.payment_method] ?? o.payment_method}
                    </span>
                  </td>
                  <td>
                    <span className={`adm-badge adm-badge--${o.payment_status}`}>
                      {o.payment_status}
                    </span>
                  </td>
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
    </>
  );
}
