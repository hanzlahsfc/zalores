"use client";

import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/format";
import { supabase, type ProductRow } from "@/lib/supabase";

export default function AdminProducts() {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!supabase) return;
    supabase
      .from("zl_products")
      .select("*")
      .order("name")
      .then(({ data }) => {
        setProducts((data ?? []) as ProductRow[]);
        setLoading(false);
      });
  }, []);

  async function save(p: ProductRow) {
    if (!supabase) return;
    const { error } = await supabase
      .from("zl_products")
      .update({ price: p.price, stock: p.stock, active: p.active })
      .eq("slug", p.slug);
    setMsg(error ? `Error: ${error.message}` : `${p.name} saved`);
    setTimeout(() => setMsg(""), 2500);
  }

  function patch(slug: string, k: keyof ProductRow, v: unknown) {
    setProducts(products.map((p) => (p.slug === slug ? { ...p, [k]: v } : p)));
  }

  if (loading) return <div className="adm-splash">Loading products…</div>;

  return (
    <>
      <h1>Products</h1>
      <p className="adm-sub">
        Price and stock used at checkout. Storefront display comes from the code catalog.
      </p>
      <div className="adm-card">
        <table className="adm-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>SKU</th>
              <th>Variants</th>
              <th>Price (Rs)</th>
              <th>Stock</th>
              <th>Active</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.slug}>
                <td>{p.name}</td>
                <td className="adm-muted">{p.sku}</td>
                <td className="adm-muted">{p.colorways?.length ?? 0}</td>
                <td>
                  <input
                    type="number"
                    min={0}
                    style={{ width: 90, border: "1px solid #d3d8dd", borderRadius: 6, padding: "4px 8px" }}
                    value={p.price}
                    onChange={(e) => patch(p.slug, "price", Number(e.target.value))}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min={0}
                    style={{ width: 70, border: "1px solid #d3d8dd", borderRadius: 6, padding: "4px 8px" }}
                    value={p.stock}
                    onChange={(e) => patch(p.slug, "stock", Number(e.target.value))}
                  />
                </td>
                <td>
                  <input
                    type="checkbox"
                    checked={p.active}
                    onChange={(e) => patch(p.slug, "active", e.target.checked)}
                  />
                </td>
                <td>
                  <button type="button" className="adm-btn adm-btn--sm" onClick={() => save(p)}>
                    Save
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {msg && <p className="adm-msg ok">{msg}</p>}
      <p className="adm-muted" style={{ marginTop: 10 }}>
        {formatPrice(products.reduce((a, p) => a + p.price * p.stock, 0))} inventory value at retail.
      </p>
    </>
  );
}
