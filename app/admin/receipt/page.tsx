"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { formatPrice } from "@/lib/format";
import {
  fmtDate,
  PAYMENT_LABELS,
  supabase,
  type OrderItemRow,
  type OrderRow,
} from "@/lib/supabase";

interface StoreCfg {
  store_name: string;
  store_address: string;
  store_phone: string;
  receipt_footer: string;
}

const DEFAULT_CFG: StoreCfg = {
  store_name: "Zalores",
  store_address: "Zalores Studio, DHA Phase 5, Lahore",
  store_phone: "+92 300 0134200",
  receipt_footer: "Thank you for shopping with us.",
};

function Receipt() {
  const params = useSearchParams();
  const id = params.get("id");
  const type = params.get("type") === "invoice" ? "invoice" : "thermal";
  const [order, setOrder] = useState<OrderRow | null>(null);
  const [items, setItems] = useState<OrderItemRow[]>([]);
  const [cfg, setCfg] = useState<StoreCfg>(DEFAULT_CFG);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!supabase || !id) return;
    (async () => {
      const [{ data: o }, { data: i }, { data: s }] = await Promise.all([
        supabase.from("zl_orders").select("*").eq("id", id).single(),
        supabase.from("zl_order_items").select("*").eq("order_id", id),
        supabase.from("zl_settings").select("value").eq("key", "store").single(),
      ]);
      setOrder(o as OrderRow | null);
      setItems((i ?? []) as OrderItemRow[]);
      if (s?.value) setCfg({ ...DEFAULT_CFG, ...(s.value as Partial<StoreCfg>) });
      setReady(true);
    })();
  }, [id]);

  useEffect(() => {
    if (ready && order) {
      const t = setTimeout(() => window.print(), 600);
      return () => clearTimeout(t);
    }
  }, [ready, order]);

  if (!ready) return <div className="adm-splash">Preparing print view…</div>;
  if (!order) return <div className="adm-splash">Order not found.</div>;

  const a = order.address ?? {};
  const pay = PAYMENT_LABELS[order.payment_method] ?? order.payment_method;

  if (type === "invoice") {
    return (
      <>
        <div className="print-actions">
          <button type="button" className="adm-btn" onClick={() => window.print()}>
            Print invoice
          </button>
          <a className="adm-btn adm-btn--ghost" href={`/admin/order/?id=${order.id}`}>
            Back to order
          </a>
        </div>
        <div className="invoice-sheet">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <h1>{cfg.store_name}</h1>
              <p className="adm-muted" style={{ margin: "4px 0 0" }}>
                {cfg.store_address}
                <br />
                {cfg.store_phone}
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <h2 style={{ margin: 0 }}>INVOICE</h2>
              <p style={{ margin: "4px 0 0" }}>
                <strong>{order.order_number}</strong>
                <br />
                {fmtDate(order.created_at)}
              </p>
            </div>
          </div>
          <hr style={{ border: 0, borderTop: "1px solid #e3e6ea", margin: "18px 0" }} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div>
              <h3 style={{ fontSize: 12, textTransform: "uppercase", color: "#637083", margin: "0 0 6px" }}>Bill to</h3>
              <p style={{ margin: 0, lineHeight: 1.6 }}>
                {order.customer_name}
                <br />
                {[a.address, a.apt].filter(Boolean).join(", ")}
                <br />
                {a.city}
                {a.postal ? ` ${a.postal}` : ""}, {a.province}
                <br />
                {order.phone} · {order.email}
              </p>
            </div>
            <div>
              <h3 style={{ fontSize: 12, textTransform: "uppercase", color: "#637083", margin: "0 0 6px" }}>Payment</h3>
              <p style={{ margin: 0, lineHeight: 1.6 }}>
                {pay}
                <br />
                {order.shipping_label}
                <br />
                Status: {order.status} · {order.payment_status}
              </p>
            </div>
          </div>
          <table className="invoice-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Unit price</th>
                <th style={{ textAlign: "right" }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {items.map((i) => (
                <tr key={i.id}>
                  <td>
                    {i.name}
                    {i.colorway ? ` — ${i.colorway}` : ""}
                  </td>
                  <td>{i.qty}</td>
                  <td>{formatPrice(i.unit_price)}</td>
                  <td style={{ textAlign: "right" }}>{formatPrice(i.line_total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <table style={{ width: 260, marginLeft: "auto", fontSize: 14 }}>
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
                <td>Shipping</td>
                <td style={{ textAlign: "right" }}>
                  {order.shipping === 0 ? "FREE" : formatPrice(order.shipping)}
                </td>
              </tr>
              <tr>
                <td style={{ fontWeight: 700, paddingTop: 8 }}>Total</td>
                <td style={{ textAlign: "right", fontWeight: 700, paddingTop: 8 }}>
                  {formatPrice(order.total)}
                </td>
              </tr>
              {order.payment_method === "cod" && (
                <tr>
                  <td style={{ color: "#92600a", paddingTop: 6 }}>Collect on delivery</td>
                  <td style={{ textAlign: "right", color: "#92600a", paddingTop: 6 }}>
                    {order.payment_status === "paid" ? "Collected" : formatPrice(order.total)}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <p className="adm-muted" style={{ marginTop: 40, textAlign: "center" }}>
            {cfg.receipt_footer}
          </p>
        </div>
      </>
    );
  }

  // 80mm thermal receipt
  return (
    <>
      <div className="print-actions">
        <button type="button" className="adm-btn" onClick={() => window.print()}>
          Print receipt
        </button>
        <a className="adm-btn adm-btn--ghost" href={`/admin/order/?id=${order.id}`}>
          Back to order
        </a>
      </div>
      <div className="receipt-sheet">
        <h1>{cfg.store_name}</h1>
        <p className="r-center" style={{ margin: "4px 0" }}>
          {cfg.store_address}
          <br />
          {cfg.store_phone}
        </p>
        <hr />
        <table>
          <tbody>
            <tr>
              <td>Order</td>
              <td className="r-r">
                <strong>{order.order_number}</strong>
              </td>
            </tr>
            <tr>
              <td>Date</td>
              <td className="r-r">{fmtDate(order.created_at)}</td>
            </tr>
            <tr>
              <td>Customer</td>
              <td className="r-r">{order.customer_name}</td>
            </tr>
            <tr>
              <td>Phone</td>
              <td className="r-r">{order.phone}</td>
            </tr>
            <tr>
              <td>City</td>
              <td className="r-r">{a.city}</td>
            </tr>
          </tbody>
        </table>
        <hr />
        <table>
          <tbody>
            {items.map((i) => (
              <tr key={i.id}>
                <td>
                  {i.name}
                  {i.colorway ? (
                    <>
                      <br />
                      <small>{i.colorway}</small>
                    </>
                  ) : null}
                  <br />
                  <small>
                    {i.qty} x {formatPrice(i.unit_price)}
                  </small>
                </td>
                <td className="r-r">{formatPrice(i.line_total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <hr />
        <table>
          <tbody>
            <tr>
              <td>Subtotal</td>
              <td className="r-r">{formatPrice(order.subtotal)}</td>
            </tr>
            {order.discount > 0 && (
              <tr>
                <td>Discount{order.discount_code ? ` (${order.discount_code})` : ""}</td>
                <td className="r-r">-{formatPrice(order.discount)}</td>
              </tr>
            )}
            <tr>
              <td>Shipping</td>
              <td className="r-r">{order.shipping === 0 ? "FREE" : formatPrice(order.shipping)}</td>
            </tr>
            <tr>
              <td>
                <strong>TOTAL</strong>
              </td>
              <td className="r-r">
                <strong>{formatPrice(order.total)}</strong>
              </td>
            </tr>
            <tr>
              <td>{pay}</td>
              <td className="r-r">
                {order.payment_method === "cod"
                  ? order.payment_status === "paid"
                    ? "COLLECTED"
                    : "COLLECT ON DELIVERY"
                  : order.payment_status.toUpperCase()}
              </td>
            </tr>
          </tbody>
        </table>
        <hr />
        <p className="r-center" style={{ margin: "4px 0" }}>
          {cfg.receipt_footer}
        </p>
        <p className="r-center" style={{ margin: 0 }}>
          {order.order_number}
        </p>
      </div>
    </>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="adm-splash">Preparing print view…</div>}>
      <Receipt />
    </Suspense>
  );
}
