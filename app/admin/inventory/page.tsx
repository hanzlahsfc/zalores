"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase, type ProductRow } from "@/lib/supabase";
import { useAdmin } from "@/components/admin/AdminShell";

interface Line {
  slug: string;
  product: string;
  idx: number;
  variant: string;
  sku: string;
  image: string;
  stock: number;
}

export default function InventoryPage() {
  const { toast } = useAdmin();
  const [rows, setRows] = useState<ProductRow[]>([]);
  const [edits, setEdits] = useState<Record<string, number>>({});
  const [q, setQ] = useState("");
  const [lowOnly, setLowOnly] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  async function load() {
    if (!supabase) return;
    const { data } = await supabase.from("zl_products").select("*").neq("status", "archived").order("sort");
    setRows((data ?? []) as ProductRow[]);
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, []);

  const lines = useMemo<Line[]>(
    () =>
      rows.flatMap((p) =>
        p.colorways.map((v, idx) => ({
          slug: p.slug,
          product: p.name,
          idx,
          variant: p.colorways.length > 1 ? `${v.name} / ${v.lensName}` : "Default",
          sku: (v as { sku?: string }).sku || (p.sku ? (p.colorways.length > 1 ? `${p.sku}-${idx + 1}` : p.sku) : ""),
          image: v.image || p.image,
          stock: typeof v.stock === "number" ? v.stock : idx === 0 ? p.stock : 0,
        })),
      ),
    [rows],
  );

  const key = (l: Line) => `${l.slug}#${l.idx}`;
  const shown = lines.filter((l) => {
    const n = edits[key(l)] ?? l.stock;
    const needle = q.trim().toLowerCase();
    return (!lowOnly || n <= 5) && (!needle || `${l.product} ${l.variant} ${l.sku}`.toLowerCase().includes(needle));
  });
  const changed = Object.keys(edits).length;

  async function save() {
    if (!supabase || !changed) return;
    setSaving(true);
    const bySlug = new Map<string, ProductRow>();
    for (const k of Object.keys(edits)) {
      const [slug, idx] = k.split("#");
      const p = bySlug.get(slug) ?? structuredClone(rows.find((r) => r.slug === slug)!);
      p.colorways[Number(idx)] = { ...p.colorways[Number(idx)], stock: Math.max(0, edits[k]) };
      bySlug.set(slug, p);
    }
    for (const p of bySlug.values()) {
      const stock = p.colorways.reduce((a, v) => a + (Number(v.stock) || 0), 0);
      const { error } = await supabase
        .from("zl_products")
        .update({ colorways: p.colorways, stock, updated_at: new Date().toISOString() })
        .eq("slug", p.slug);
      if (error) {
        setSaving(false);
        return toast(error.message, true);
      }
    }
    setSaving(false);
    setEdits({});
    toast(`Inventory updated for ${bySlug.size} product${bySlug.size > 1 ? "s" : ""}`);
    load();
  }

  if (loading) return <div className="adm-splash">Loading inventory…</div>;

  return (
    <div className="adm-page adm-page--wide">
      {changed > 0 && (
        <div className="adm-savebar">
          <div className="adm-savebar__msg">
            {changed} unsaved change{changed > 1 ? "s" : ""}
          </div>
          <button type="button" className="adm-btn adm-btn--ghost" onClick={() => setEdits({})}>
            Discard
          </button>
          <button type="button" className="adm-btn" onClick={save} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      )}
      <div className="adm-head">
        <h1>Inventory</h1>
      </div>
      <div className="adm-card adm-card--flush">
        <div className="adm-filterbar" style={{ alignItems: "center" }}>
          <input className="adm-search" placeholder="Search products, variants or SKU" value={q} onChange={(e) => setQ(e.target.value)} />
          <label className="adm-check" style={{ whiteSpace: "nowrap" }}>
            <input type="checkbox" checked={lowOnly} onChange={(e) => setLowOnly(e.target.checked)} /> Low stock (≤5)
          </label>
        </div>
        <table className="adm-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>SKU</th>
              <th style={{ width: 130 }}>Available</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((l) => {
              const k = key(l);
              const val = edits[k] ?? l.stock;
              return (
                <tr key={k}>
                  <td>
                    <div className="adm-cell-title">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      {l.image ? <img className="adm-thumb" src={l.image} alt="" /> : <span className="adm-thumb adm-thumb--empty">▢</span>}
                      <div>
                        <Link href={`/admin/product/?slug=${encodeURIComponent(l.slug)}`}>{l.product}</Link>
                        <div className="adm-muted">{l.variant}</div>
                      </div>
                    </div>
                  </td>
                  <td className="adm-muted">{l.sku || "No SKU"}</td>
                  <td>
                    <input
                      className="adm-input"
                      type="number"
                      min={0}
                      value={val}
                      style={val <= 5 ? { borderColor: "#c70a24" } : undefined}
                      onChange={(e) => {
                        const n = Number(e.target.value);
                        setEdits((x) => {
                          const next = { ...x };
                          if (n === l.stock) delete next[k];
                          else next[k] = n;
                          return next;
                        });
                      }}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {shown.length === 0 && <div className="adm-empty">No inventory matches.</div>}
      </div>
    </div>
  );
}
