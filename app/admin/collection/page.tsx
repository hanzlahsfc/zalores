"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { supabase, type CollectionRow, type ProductRow } from "@/lib/supabase";
import { removeImage, slugify } from "@/lib/admin-api";
import MediaManager from "@/components/admin/MediaManager";
import { useAdmin } from "@/components/admin/AdminShell";

const blank: CollectionRow = { slug: "", name: "", description: "", image: "", sort: 0 };

function CollectionEditor() {
  const params = useSearchParams();
  const router = useRouter();
  const { publish, toast } = useAdmin();
  const isNew = params.get("new") === "1";
  const slugParam = params.get("slug");
  const [orig, setOrig] = useState<CollectionRow | null>(null);
  const [c, setC] = useState<CollectionRow>(blank);
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [members, setMembers] = useState<string[]>([]);
  const [origMembers, setOrigMembers] = useState<string[]>([]);
  const [addSlug, setAddSlug] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) return;
    (async () => {
      const { data: p } = await supabase.from("zl_products").select("*").order("sort");
      const all = (p ?? []) as ProductRow[];
      setProducts(all);
      if (!isNew && slugParam) {
        const { data } = await supabase.from("zl_collections").select("*").eq("slug", slugParam).maybeSingle();
        if (data) {
          setC(data as CollectionRow);
          setOrig(data as CollectionRow);
          const m = all.filter((x) => x.collection === slugParam).map((x) => x.slug);
          setMembers(m);
          setOrigMembers(m);
        }
      } else {
        setOrig(blank);
      }
      setLoading(false);
    })();
  }, [isNew, slugParam]);

  const dirty =
    JSON.stringify(c) !== JSON.stringify(orig) || JSON.stringify([...members].sort()) !== JSON.stringify([...origMembers].sort());

  async function save() {
    if (!supabase) return;
    if (!c.name.trim()) return toast("Title can't be blank", true);
    const slug = c.slug || slugify(c.name);
    setSaving(true);
    let sort = c.sort;
    if (isNew) {
      const { data: last } = await supabase.from("zl_collections").select("sort").order("sort", { ascending: false }).limit(1);
      sort = ((last?.[0]?.sort as number) ?? 0) + 1;
    }
    const row = { slug, name: c.name.trim(), description: c.description, image: c.image, sort };
    const res =
      !isNew && orig && slug !== orig.slug
        ? await supabase.from("zl_collections").update(row).eq("slug", orig.slug)
        : await supabase.from("zl_collections").upsert(row);
    if (res.error) {
      setSaving(false);
      return toast(res.error.message, true);
    }
    const removed = origMembers.filter((s) => !members.includes(s));
    if (removed.length) await supabase.from("zl_products").update({ collection: null }).in("slug", removed);
    if (members.length) await supabase.from("zl_products").update({ collection: slug }).in("slug", members);
    if (orig?.image && orig.image !== row.image) removeImage(orig.image);
    setSaving(false);
    toast(isNew ? "Collection created" : "Collection saved");
    publish();
    setOrig({ ...c, ...row });
    setC({ ...c, ...row });
    setOrigMembers(members);
    if (isNew || slug !== slugParam) router.replace(`/admin/collection/?slug=${encodeURIComponent(slug)}`);
  }

  async function del() {
    if (!supabase || !orig || isNew) return;
    if (!confirm(`Delete collection ${orig.name}? Products stay, they just leave this collection.`)) return;
    await supabase.from("zl_products").update({ collection: null }).eq("collection", orig.slug);
    const { error } = await supabase.from("zl_collections").delete().eq("slug", orig.slug);
    if (error) return toast(error.message, true);
    if (orig.image) removeImage(orig.image);
    toast("Collection deleted");
    publish();
    router.replace("/admin/collections/");
  }

  if (loading) return <div className="adm-splash">Loading collection…</div>;
  if (!isNew && !orig?.slug) return <div className="adm-splash">Collection not found.</div>;

  const inList = products.filter((p) => members.includes(p.slug));
  const addable = products.filter((p) => !members.includes(p.slug));

  return (
    <div className="adm-page">
      {(dirty || isNew) && (
        <div className="adm-savebar">
          <div className="adm-savebar__msg">{isNew ? "Unsaved collection" : "Unsaved changes"}</div>
          {!isNew && orig && (
            <button
              type="button"
              className="adm-btn adm-btn--ghost"
              onClick={() => {
                setC(orig);
                setMembers(origMembers);
              }}
            >
              Discard
            </button>
          )}
          <button type="button" className="adm-btn" onClick={save} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      )}
      <div className="adm-head">
        <Link href="/admin/collections/" className="adm-back" aria-label="Back">
          ←
        </Link>
        <h1>{isNew ? "Create collection" : orig?.name}</h1>
        {!isNew && (
          <div className="adm-head__actions">
            <a className="adm-btn adm-btn--ghost" href={`/shop/?collection=${orig?.slug}`} target="_blank" rel="noreferrer">
              View
            </a>
          </div>
        )}
      </div>
      <div className="adm-layout">
        <div>
          <div className="adm-card">
            <div className="adm-field">
              <label>Title</label>
              <input
                value={c.name}
                placeholder="e.g. Summer collection"
                onChange={(e) => setC({ ...c, name: e.target.value, slug: isNew ? slugify(e.target.value) : c.slug })}
              />
            </div>
            <div className="adm-field">
              <label>Description</label>
              <textarea rows={4} value={c.description} onChange={(e) => setC({ ...c, description: e.target.value })} />
            </div>
          </div>

          <div className="adm-card adm-card--flush">
            <div className="adm-card__head" style={{ padding: "16px 16px 0" }}>
              <h2>Products</h2>
            </div>
            <div className="adm-filterbar">
              <select className="adm-input" value={addSlug} onChange={(e) => setAddSlug(e.target.value)}>
                <option value="">Add a product…</option>
                {addable.map((p) => (
                  <option key={p.slug} value={p.slug}>
                    {p.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="adm-btn adm-btn--ghost"
                disabled={!addSlug}
                onClick={() => {
                  setMembers([...members, addSlug]);
                  setAddSlug("");
                }}
              >
                Add
              </button>
            </div>
            {inList.length === 0 ? (
              <div className="adm-empty">There are no products in this collection.</div>
            ) : (
              <table className="adm-table">
                <tbody>
                  {inList.map((p, i) => (
                    <tr key={p.slug}>
                      <td style={{ width: 24 }} className="adm-muted">
                        {i + 1}.
                      </td>
                      <td>
                        <div className="adm-cell-title">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          {p.image ? <img className="adm-thumb" src={p.image} alt="" /> : <span className="adm-thumb adm-thumb--empty">▢</span>}
                          <Link href={`/admin/product/?slug=${encodeURIComponent(p.slug)}`}>{p.name}</Link>
                        </div>
                      </td>
                      <td>
                        <span className={`adm-badge adm-badge--${p.status}`}>{p.status}</span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <button type="button" className="adm-btn adm-btn--plain" onClick={() => setMembers(members.filter((s) => s !== p.slug))}>
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
        <div>
          <div className="adm-card">
            <h2>Image</h2>
            <MediaManager single media={c.image ? [c.image] : []} onChange={(m) => setC({ ...c, image: m[0] ?? "" })} onError={(m) => toast(m, true)} />
          </div>
          <div className="adm-card">
            <h2>URL handle</h2>
            <div className="adm-field">
              <input value={c.slug} onChange={(e) => setC({ ...c, slug: slugify(e.target.value) })} />
              <span className="adm-help">/shop/?collection={c.slug || "handle"}</span>
            </div>
          </div>
          {!isNew && (
            <div className="adm-card">
              <button type="button" className="adm-btn adm-btn--critical" onClick={del}>
                Delete collection
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="adm-splash">Loading collection…</div>}>
      <CollectionEditor />
    </Suspense>
  );
}
