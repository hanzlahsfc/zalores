"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { formatPrice } from "@/lib/format";
import {
  fmtDate,
  ORDER_STATUSES,
  STATUS_HINTS,
  PAYMENT_LABELS,
  supabase,
  type OrderItemRow,
  type OrderRow,
} from "@/lib/supabase";
import { useOrdersRealtime } from "@/lib/useOrdersRealtime";

function OrderDetail() {
  const params = useSearchParams();
  const id = params.get("id");
  const [order, setOrder] = useState<OrderRow | null>(null);
  const [items, setItems] = useState<OrderItemRow[]>([]);
  const [note, setNote] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);

  useOrdersRealtime({
    update: (o) => setOrder((prev) => (prev && o.id === prev.id ? o : prev)),
  });

  useEffect(() => {
    if (!supabase || !id) return;
    (async () => {
      const [{ data: o }, { data: i }] = await Promise.all([
        supabase.from("zl_orders").select("*").eq("id", id).single(),
        supabase.from("zl_order_items").select("*").eq("order_id", id),
      ]);
      setOrder(o as OrderRow | null);
      setItems((i ?? []) as OrderItemRow[]);
      setNote((o as OrderRow | null)?.note ?? "");
      setLoading(false);
    })();
  }, [id]);

  async function update(patch: Partial<OrderRow>, okMsg: string) {
    if (!supabase || !order) return;
    const { error } = await supabase.from("zl_orders").update(patch).eq("id", order.id);
    if (error) {
      setMsg(`Error: ${error.message}`);
      return;
    }
    setOrder({ ...order, ...patch });
    setMsg(okMsg);
    setTimeout(() => setMsg(""), 3000);
  }

  if (loading) return <div className="adm-splash">Loading order…</div>;
  if (!order) return <div className="adm-splash">Order not found.</div>;

  const a = order.address ?? {};

  return (
    <div className="adm-page">
      <p style={{ marginBottom: 8 }}>
        <Link href="/admin/orders/" className="adm-muted">
          ← Back to orders
        </Link>
      </p>
      <h1>
        {order.order_number}{" "}
        <span className={`adm-badge adm-badge--${order.status}`}>{order.status}</span>
      </h1>
      <p className="adm-sub">
        {fmtDate(order.created_at)} · {PAYMENT_LABELS[order.payment_method] ?? order.payment_method}
        {order.payment_method === "cod" && (
          <>
            {" "}
            ·{" "}
            <span className={`adm-badge adm-badge--${order.payment_status}`}>
              {order.payment_status}
            </span>
          </>
        )}
      </p>

      <div className="adm-grid2">
        <div>
          <div className="adm-card">
            <h2>Items</h2>
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th style={{ textAlign: "right" }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {items.map((i) => (
                  <tr key={i.id}>
                    <td>
                      {i.name}
                      {i.colorway && (
                        <>
                          <br />
                          <span className="adm-muted">{i.colorway}</span>
                        </>
                      )}
                    </td>
                    <td>{i.qty}</td>
                    <td>{formatPrice(i.unit_price)}</td>
                    <td style={{ textAlign: "right" }}>{formatPrice(i.line_total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <table className="adm-table" style={{ marginTop: 12 }}>
              <tbody>
                <tr>
                  <td>Subtotal</td>
                  <td style={{ textAlign: "right" }}>{formatPrice(order.subtotal)}</td>
                </tr>
                {order.discount > 0 && (
                  <tr>
                    <td>Discount{order.discount_code ? ` (${order.discount_code})` : ""}</td>
                    <td style={{ textAlign: "right" }}>-{formatPrice(order.discount)}</td>
                  </tr>
                )}
                <tr>
                  <td>Shipping ({order.shipping_label ?? order.shipping_method})</td>
                  <td style={{ textAlign: "right" }}>
                    {order.shipping === 0 ? "FREE" : formatPrice(order.shipping)}
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>Total</strong>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <strong>{formatPrice(order.total)}</strong>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="adm-card">
            <h2>Order note</h2>
            <div className="adm-field">
              <textarea
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Internal note, rider instructions, etc."
              />
            </div>
            <button
              type="button"
              className="adm-btn adm-btn--ghost adm-btn--sm"
              onClick={() => update({ note }, "Note saved")}
            >
              Save note
            </button>
          </div>
        </div>

        <div>
          <div className="adm-card">
            <h2>Customer</h2>
            <p style={{ margin: "0 0 4px" }}>
              <strong>{order.customer_name || "—"}</strong>
            </p>
            <p className="adm-muted" style={{ margin: "0 0 4px" }}>
              {order.email}
            </p>
            <p className="adm-muted" style={{ margin: 0 }}>
              {order.phone}
            </p>
          </div>

          <div className="adm-card">
            <h2>Delivery address</h2>
            <p style={{ margin: 0, lineHeight: 1.6 }}>
              {[a.address, a.apt].filter(Boolean).join(", ")}
              <br />
              {a.city}
              {a.postal ? ` ${a.postal}` : ""}, {a.province}
              <br />
              {a.country}
            </p>
          </div>

          <div className="adm-card">
            <h2>Fulfillment</h2>
            <div className="adm-field">
              <label>Order status</label>
              <select
                value={order.status}
                onChange={(e) => {
                  const status = e.target.value;
                  update(
                    status === "completed" && order.payment_method === "cod"
                      ? { status, payment_status: "paid" }
                      : { status },
                    status === "completed" && order.payment_method === "cod"
                      ? "Completed — COD marked collected"
                      : "Status updated",
                  );
                }}
              >
                {ORDER_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s[0].toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
              <p className="adm-muted" style={{ marginTop: 6 }}>
                {STATUS_HINTS[order.status]}
              </p>
            </div>
            {order.payment_method === "cod" && order.payment_status !== "paid" && (
              <button
                type="button"
                className="adm-btn adm-btn--sm"
                onClick={() => update({ payment_status: "paid" }, "Marked as paid")}
              >
                Mark COD collected
              </button>
            )}
            {order.payment_status === "paid" && (
              <p className="adm-msg ok">Payment collected.</p>
            )}
            <p className="adm-muted" style={{ marginTop: 10 }}>
              Confirmation email: {order.email_sent ? "sent" : "not sent (Resend not configured)"}
            </p>
          </div>

          <div className="adm-card">
            <h2>Print</h2>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <a
                className="adm-btn adm-btn--sm"
                href={`/admin/receipt/?id=${order.id}&type=thermal`}
                target="_blank"
                rel="noreferrer"
              >
                Print receipt (80mm)
              </a>
              <a
                className="adm-btn adm-btn--ghost adm-btn--sm"
                href={`/admin/receipt/?id=${order.id}&type=invoice`}
                target="_blank"
                rel="noreferrer"
              >
                Print invoice (A4)
              </a>
            </div>
          </div>
        </div>
      </div>
      {msg && <p className="adm-msg ok">{msg}</p>}
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="adm-splash">Loading order…</div>}>
      <OrderDetail />
    </Suspense>
  );
}
