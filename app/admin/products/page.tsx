"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { supabase, type CollectionRow, type ProductRow } from "@/lib/supabase";
import { removeImage } from "@/lib/admin-api";
import { useAdmin } from "@/components/admin/AdminShell";

const TABS = ["all", "active", "draft", "archived"] as const;

function inventoryLabel(p: ProductRow) {
  const tracked = p.colorways.filter((v) => typeof v.stock === "number");
  const total = tracked.length ? tracked.reduce((a, v) => a + (v.stock ?? 0), 0) : p.stock;
  const variants = p.colorways.length;
  const text = `${total} in stock${variants > 1 ? ` for ${variants} variants` : ""}`;
  return { total, text };
}

function ProductsList() {
  const router = useRouter();
  const params = useSearchParams();
  const { publish, toast } = useAdmin();
  const [rows, setRows] = useState<ProductRow[]>([]);
  const [collections, setCollections] = useState<CollectionRow[]>([]);
  const [tab, setTab] = useState<(typeof TABS)[number]>("all");
  const [q, setQ] = useState(params.get("q") ?? "");
  const [sel, setSel] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    if (!supabase) return;
    const [{ data: p }, { data: c }] = await Promise.all([
      supabase.from("zl_products").select("*").order("sort").order("created_at"),
      supabase.from("zl_collections").select("*").order("sort"),
    ]);
    setRows((p ?? []) as ProductRow[]);
    setCollections((c ?? []) as CollectionRow[]);
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, []);

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return rows.filter(
      (r) =>
        (tab === "all" || r.status === tab) &&
        (!needle ||
          [r.name, r.sku, r.vendor, r.collection, ...(r.tags ?? []), ...r.colorways.map((v) => v.name)]
            .join(" ")
            .toLowerCase()
            .includes(needle)),
    );
  }, [rows, tab, q]);

  const colName = (slug: string | null) => collections.find((c) => c.slug === slug)?.name ?? "";
  const allSel = list.length > 0 && list.every((r) => sel.includes(r.slug));

  async function bulkStatus(status: string) {
    if (!supabase || !sel.length) return;
    const { error } = await supabase
      .from("zl_products")
      .update({ status, active: status === "active", updated_at: new Date().toISOString() })
      .in("slug", sel);
    if (error) return toast(error.message, true);
    toast(`${sel.length} product${sel.length > 1 ? "s" : ""} set to ${status}`);
    setSel([]);
    await load();
    publish();
  }

  async function bulkDelete() {
    if (!supabase || !sel.length) return;
    if (!confirm(`Delete ${sel.length} product${sel.length > 1 ? "s" : ""}? This can't be undone.`)) return;
    const doomed = rows.filter((r) => sel.includes(r.slug));
    const { error } = await supabase.from("zl_products").delete().in("slug", sel);
    if (error) return toast(error.message, true);
    for (const r of doomed) {
      for (const url of [r.image, ...(r.gallery ?? []), ...r.colorways.map((v) => v.image ?? "")]) {
        if (url) removeImage(url);
      }
    }
    toast(`Deleted ${sel.length} product${sel.length > 1 ? "s" : ""}`);
    setSel([]);
    await load();
    publish();
  }

  if (loading) return <div className="adm-splash">Loading products…</div>;

  return (
    <div className="adm-page adm-page--wide">
      <div className="adm-head">
        <h1>Products</h1>
        <div className="adm-head__actions">
          <Link href="/admin/inventory/" className="adm-btn adm-btn--ghost">
            Inventory
          </Link>
          <Link href="/admin/product/?new=1" className="adm-btn">
            Add product
          </Link>
        </div>
      </div>

      <div className="adm-card adm-card--flush">
        <div className="adm-tabs">
          {TABS.map((t) => (
            <button key={t} type="button" className={`adm-tab${tab === t ? " active" : ""}`} onClick={() => setTab(t)}>
              {t[0].toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
        <div className="adm-filterbar">
          <input className="adm-search" placeholder="Search products" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        {sel.length > 0 && (
          <div className="adm-filterbar" style={{ alignItems: "center", background: "#f7f7f7" }}>
            <strong style={{ marginRight: 8 }}>{sel.length} selected</strong>
            <button className="adm-btn adm-btn--ghost adm-btn--sm" onClick={() => bulkStatus("active")}>
              Set as active
            </button>
            <button className="adm-btn adm-btn--ghost adm-btn--sm" onClick={() => bulkStatus("draft")}>
              Set as draft
            </button>
            <button className="adm-btn adm-btn--ghost adm-btn--sm" onClick={() => bulkStatus("archived")}>
              Archive
            </button>
            <button className="adm-btn adm-btn--critical adm-btn--sm" onClick={bulkDelete}>
              Delete
            </button>
          </div>
        )}

        {list.length === 0 ? (
          <div className="adm-empty">
            <h3>{rows.length ? "No products found" : "Add your first product"}</h3>
            <p>{rows.length ? "Try changing the filters or search term." : "Start by stocking your store with products."}</p>
            {!rows.length && (
              <Link href="/admin/product/?new=1" className="adm-btn">
                Add product
              </Link>
            )}
          </div>
        ) : (
          <table className="adm-table">
            <thead>
              <tr>
                <th style={{ width: 32 }}>
                  <input
                    type="checkbox"
                    checked={allSel}
                    onChange={() => setSel(allSel ? [] : list.map((r) => r.slug))}
                    aria-label="Select all"
                  />
                </th>
                <th>Product</th>
                <th>Status</th>
                <th>Inventory</th>
                <th>Collection</th>
                <th>Vendor</th>
              </tr>
            </thead>
            <tbody>
              {list.map((r) => {
                const inv = inventoryLabel(r);
                const thumb = r.image || r.colorways[0]?.image;
                return (
                  <tr key={r.slug} className="clickable" onClick={() => router.push(`/admin/product/?slug=${encodeURIComponent(r.slug)}`)}>
                    <td onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={sel.includes(r.slug)}
                        onChange={() => setSel((s) => (s.includes(r.slug) ? s.filter((x) => x !== r.slug) : [...s, r.slug]))}
                        aria-label={`Select ${r.name}`}
                      />
                    </td>
                    <td>
                      <div className="adm-cell-title">
                        {thumb ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img className="adm-thumb" src={thumb} alt="" />
                        ) : (
                          <span className="adm-thumb adm-thumb--empty">▢</span>
                        )}
                        <strong>{r.name}</strong>
                      </div>
                    </td>
                    <td>
                      <span className={`adm-badge adm-badge--${r.status}`}>{r.status}</span>
                    </td>
                    <td className={inv.total <= 5 ? "adm-stock-low" : "adm-muted"}>{inv.text}</td>
                    <td className="adm-muted">{colName(r.collection)}</td>
                    <td className="adm-muted">{r.vendor}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="adm-splash">Loading products…</div>}>
      <ProductsList />
    </Suspense>
  );
}
