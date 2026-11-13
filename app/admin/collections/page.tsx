"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase, type CollectionRow } from "@/lib/supabase";

export default function CollectionsPage() {
  const router = useRouter();
  const [rows, setRows] = useState<CollectionRow[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) return;
    (async () => {
      const [{ data: c }, { data: p }] = await Promise.all([
        supabase.from("zl_collections").select("*").order("sort"),
        supabase.from("zl_products").select("collection"),
      ]);
      const n: Record<string, number> = {};
      for (const r of (p ?? []) as { collection: string | null }[]) if (r.collection) n[r.collection] = (n[r.collection] ?? 0) + 1;
      setRows((c ?? []) as CollectionRow[]);
      setCounts(n);
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="adm-splash">Loading collections…</div>;

  return (
    <div className="adm-page">
      <div className="adm-head">
        <h1>Collections</h1>
        <div className="adm-head__actions">
          <Link href="/admin/collection/?new=1" className="adm-btn">
            Create collection
          </Link>
        </div>
      </div>
      <div className="adm-card adm-card--flush">
        {rows.length === 0 ? (
          <div className="adm-empty">
            <h3>Group your products into collections</h3>
            <p>Collections appear as filters and tiles on your storefront.</p>
          </div>
        ) : (
          <table className="adm-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Products</th>
                <th>Handle</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.slug} className="clickable" onClick={() => router.push(`/admin/collection/?slug=${encodeURIComponent(c.slug)}`)}>
                  <td>
                    <div className="adm-cell-title">
                      {c.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img className="adm-thumb" src={c.image} alt="" style={{ objectFit: "cover" }} />
                      ) : (
                        <span className="adm-thumb adm-thumb--empty">▢</span>
                      )}
                      <strong>{c.name}</strong>
                    </div>
                  </td>
                  <td>{counts[c.slug] ?? 0}</td>
                  <td className="adm-muted">{c.slug}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
