"use client";

import { useEffect, useMemo, useState } from "react";
import { formatPrice } from "@/lib/format";
import { fmtDate, supabase, type OrderRow } from "@/lib/supabase";
import { useOrdersRealtime } from "@/lib/useOrdersRealtime";

interface Customer {
  email: string;
  name: string;
  phone: string;
  city: string;
  orders: number;
  spent: number;
  last: string;
}

export default function AdminCustomers() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);

  useOrdersRealtime({
    insert: () => {
      if (supabase)
        supabase
          .from("zl_orders")
          .select("*")
          .order("created_at", { ascending: false })
          .then(({ data }) =>
            setOrders(((data ?? []) as OrderRow[]).filter((o) => o.status !== "cancelled")),
          );
    },
  });

  useEffect(() => {
    if (!supabase) return;
    supabase
      .from("zl_orders")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setOrders(((data ?? []) as OrderRow[]).filter((o) => o.status !== "cancelled"));
        setLoading(false);
      });
  }, []);

  const customers = useMemo(() => {
    const map = new Map<string, Customer>();
    for (const o of orders) {
      const c = map.get(o.email) ?? {
        email: o.email,
        name: o.customer_name ?? "",
        phone: o.phone ?? "",
        city: o.address?.city ?? "",
        orders: 0,
        spent: 0,
        last: o.created_at,
      };
      c.orders += 1;
      c.spent += Number(o.total);
      if (o.created_at > c.last) {
        c.last = o.created_at;
        c.name = o.customer_name ?? c.name;
        c.phone = o.phone ?? c.phone;
        c.city = o.address?.city ?? c.city;
      }
      map.set(o.email, c);
    }
    return [...map.values()].sort((a, b) => b.spent - a.spent);
  }, [orders]);

  if (loading) return <div className="adm-splash">Loading customers…</div>;

  return (
    <div className="adm-page">
      <h1>Customers</h1>
      <p className="adm-sub">{customers.length} customers from order history</p>
      <div className="adm-card">
        {customers.length === 0 ? (
          <p className="adm-empty">No customers yet.</p>
        ) : (
          <table className="adm-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Phone</th>
                <th>City</th>
                <th>Orders</th>
                <th>Total spent</th>
                <th>Last order</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.email}>
                  <td>
                    {c.name || "—"}
                    <br />
                    <span className="adm-muted">{c.email}</span>
                  </td>
                  <td>{c.phone || "—"}</td>
                  <td>{c.city || "—"}</td>
                  <td>{c.orders}</td>
                  <td>{formatPrice(c.spent)}</td>
                  <td className="adm-muted">{fmtDate(c.last)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
