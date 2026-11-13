"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { supabase, type CollectionRow, type ProductRow } from "@/lib/supabase";
import { removeImage, slugify } from "@/lib/admin-api";
import { formatPrice } from "@/lib/format";
import { site } from "@/lib/site";
import type { Colorway } from "@/lib/types";
import MediaManager from "@/components/admin/MediaManager";
import { useAdmin } from "@/components/admin/AdminShell";

const SILHOUETTES = ["aviator", "square", "wayfarer", "round", "cat-eye", "sport", "accessory"];
const BADGES = ["", "New", "Best Seller", "Low Stock", "Sale", "Limited"];

type Variant = Colorway & { sku?: string };

const blankVariant = (): Variant => ({
  id: `v${Math.random().toString(36).slice(2, 8)}`,
  name: "Default",
  frameColor: "#2b2b2b",
  lensColor: "#3a3f45",
  lensName: "Standard",
  image: "",
  stock: 0,
});

const blankProduct = (): ProductRow => ({
  slug: "",
  name: "",
  tagline: "",
  description: "",
  price: 0,
  compare_at: null,
  collection: null,
  silhouette: "aviator",
  tint: "#f2f2f2",
  rating: 0,
  review_count: 0,
  badge: null,
  stock: 0,
  features: [],
  sku: "",
  image: "",
  gallery: [],
  colorways: [blankVariant()],
  status: "draft",
  sort: 0,
  tags: [],
  vendor: "Zalores",
  active: false,
});

const uploaded = (u: string) => u.includes("/storage/v1/object/public/product-images/");

function Editor() {
  const params = useSearchParams();
  const router = useRouter();
  const { publish, toast } = useAdmin();
  const isNew = params.get("new") === "1";
  const slugParam = params.get("slug");

  const [orig, setOrig] = useState<ProductRow | null>(null);
  const [p, setP] = useState<ProductRow>(blankProduct());
  const [media, setMedia] = useState<string[]>([]);
  const [origMedia, setOrigMedia] = useState<string[]>([]);
  const [collections, setCollections] = useState<CollectionRow[]>([]);
  const [slugTouched, setSlugTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pickFor, setPickFor] = useState<number | null>(null);
  const [featuresText, setFeaturesText] = useState("");
  const [tagsText, setTagsText] = useState("");

  useEffect(() => {
    if (!supabase) return;
    (async () => {
      const { data: c } = await supabase.from("zl_collections").select("*").order("sort");
      setCollections((c ?? []) as CollectionRow[]);
      if (isNew || !slugParam) {
        const b = blankProduct();
        setP(b);
        setOrig(b);
        setLoading(false);
        return;
      }
      const { data } = await supabase.from("zl_products").select("*").eq("slug", slugParam).maybeSingle();
      if (data) {
        const row = data as ProductRow;
        const m = [row.image, ...(row.gallery ?? [])].filter(Boolean);
        setP(row);
        setOrig(row);
        setMedia(m);
        setOrigMedia(m);
        setFeaturesText((row.features ?? []).join("\n"));
        setTagsText((row.tags ?? []).join(", "));
        setSlugTouched(true);
      }
      setLoading(false);
    })();
  }, [isNew, slugParam]);

  const set = <K extends keyof ProductRow>(k: K, v: ProductRow[K]) => setP((x) => ({ ...x, [k]: v }));
  const setVariant = (i: number, patch: Partial<Variant>) =>
    setP((x) => ({ ...x, colorways: x.colorways.map((v, j) => (j === i ? { ...v, ...patch } : v)) }));

  const draft = useMemo<ProductRow>(() => {
    const features = featuresText.split("\n").map((s) => s.trim()).filter(Boolean);
    const tags = tagsText.split(",").map((s) => s.trim()).filter(Boolean);
    const colorways = p.colorways.map((v, i) => ({ ...v, image: v.image || (i === 0 ? media[0] ?? "" : "") }));
    const stock = colorways.reduce((a, v) => a + (Number(v.stock) || 0), 0);
    return { ...p, features, tags, colorways, stock, image: media[0] ?? "", gallery: media.slice(1), active: p.status === "active" };
  }, [p, media, featuresText, tagsText]);

  const dirty = useMemo(() => {
    if (!orig) return false;
    const a = { ...draft, updated_at: undefined, created_at: undefined };
    const b = {
      ...orig,
      updated_at: undefined,
      created_at: undefined,
      features: orig.features ?? [],
      tags: orig.tags ?? [],
      image: origMedia[0] ?? "",
      gallery: origMedia.slice(1),
      colorways: orig.colorways.map((v, i) => ({ ...v, image: v.image || (i === 0 ? origMedia[0] ?? "" : "") })),
      stock: orig.colorways.reduce((s, v) => s + (Number(v.stock) || 0), 0),
      active: orig.status === "active",
    };
    return JSON.stringify(a) !== JSON.stringify(b);
  }, [draft, orig, origMedia]);

  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  async function save() {
    if (!supabase) return;
    if (!draft.name.trim()) return toast("Title can't be blank", true);
    if (!(draft.price >= 0)) return toast("Enter a valid price", true);
    if (!draft.colorways.length) return toast("Add at least one variant", true);
    let slug = (draft.slug || slugify(draft.name)).trim();
    if (!slug) return toast("Handle can't be blank", true);
    setSaving(true);

    if (isNew || slug !== orig?.slug) {
      const { data: clash } = await supabase.from("zl_products").select("slug").eq("slug", slug).maybeSingle();
      if (clash) slug = `${slug}-${Math.random().toString(36).slice(2, 5)}`;
    }
    let sort = draft.sort;
    if (isNew) {
      const { data: last } = await supabase.from("zl_products").select("sort").order("sort", { ascending: false }).limit(1);
      sort = ((last?.[0]?.sort as number) ?? 0) + 1;
    }
    const row = { ...draft, slug, sort, updated_at: new Date().toISOString() };
    delete (row as Partial<ProductRow>).created_at;

    const res =
      !isNew && orig && slug !== orig.slug
        ? await supabase.from("zl_products").update(row).eq("slug", orig.slug)
        : await supabase.from("zl_products").upsert(row);
    setSaving(false);
    if (res.error) return toast(res.error.message, true);

    const keep = new Set([...media, ...row.colorways.map((v) => v.image ?? "")]);
    for (const u of [...origMedia, ...(orig?.colorways ?? []).map((v) => v.image ?? "")]) {
      if (u && uploaded(u) && !keep.has(u)) removeImage(u);
    }

    toast(isNew ? "Product created" : "Product saved");
    publish();
    setOrig(row);
    setOrigMedia(media);
    setP(row);
    if (isNew || slug !== slugParam) router.replace(`/admin/product/?slug=${encodeURIComponent(slug)}`);
  }

  function discard() {
    if (!orig) return;
    setP(orig);
    const m = [orig.image, ...(orig.gallery ?? [])].filter(Boolean);
    setMedia(m);
    setFeaturesText((orig.features ?? []).join("\n"));
    setTagsText((orig.tags ?? []).join(", "));
  }

  async function del() {
    if (!supabase || !orig || isNew) return;
    if (!confirm(`Delete ${orig.name}? This can't be undone.`)) return;
    const { error } = await supabase.from("zl_products").delete().eq("slug", orig.slug);
    if (error) return toast(error.message, true);
    for (const u of [...origMedia, ...orig.colorways.map((v) => v.image ?? "")]) if (u && uploaded(u)) removeImage(u);
    toast("Product deleted");
    publish();
    router.replace("/admin/products/");
  }

  async function duplicate() {
    if (!supabase || !orig) return;
    const slug = `${orig.slug}-copy-${Math.random().toString(36).slice(2, 5)}`;
    const { data: last } = await supabase.from("zl_products").select("sort").order("sort", { ascending: false }).limit(1);
    const copy = {
      ...draft,
      slug,
      name: `Copy of ${draft.name}`,
      status: "draft",
      active: false,
      sort: ((last?.[0]?.sort as number) ?? 0) + 1,
    };
    delete (copy as Partial<ProductRow>).created_at;
    delete (copy as Partial<ProductRow>).updated_at;
    const { error } = await supabase.from("zl_products").insert(copy);
    if (error) return toast(error.message, true);
    toast("Product duplicated as draft");
    router.push(`/admin/product/?slug=${encodeURIComponent(slug)}`);
  }

  if (loading) return <div className="adm-splash">Loading product…</div>;
  if (!isNew && !orig?.slug) return <div className="adm-splash">Product not found.</div>;

  const handle = p.slug || slugify(p.name);
  const margin = p.compare_at && p.compare_at > p.price ? Math.round(((p.compare_at - p.price) / p.compare_at) * 100) : 0;

  return (
    <div className="adm-page">
      {(dirty || isNew) && (
        <div className="adm-savebar">
          <div className="adm-savebar__msg">{isNew ? "Unsaved product" : "Unsaved changes"}</div>
          {!isNew && (
            <button type="button" className="adm-btn adm-btn--ghost" onClick={discard} disabled={saving}>
              Discard
            </button>
          )}
          <button type="button" className="adm-btn" onClick={save} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      )}

      <div className="adm-head">
        <Link href="/admin/products/" className="adm-back" aria-label="Back to products">
          ←
        </Link>
        <h1>{isNew ? "Add product" : orig?.name}</h1>
        {!isNew && <span className={`adm-badge adm-badge--${orig?.status}`}>{orig?.status}</span>}
        {!isNew && (
          <div className="adm-head__actions">
            <button type="button" className="adm-btn adm-btn--ghost" onClick={duplicate}>
              Duplicate
            </button>
            {orig?.status === "active" && (
              <a className="adm-btn adm-btn--ghost" href={`/products/${orig.slug}/`} target="_blank" rel="noreferrer">
                View
              </a>
            )}
          </div>
        )}
      </div>

      <div className="adm-layout">
        <div>
          <div className="adm-card">
            <div className="adm-field">
              <label htmlFor="title">Title</label>
              <input
                id="title"
                value={p.name}
                placeholder="Navigator sunglasses"
                onChange={(e) => {
                  set("name", e.target.value);
                  if (!slugTouched) set("slug", slugify(e.target.value));
                }}
              />
            </div>
            <div className="adm-field">
              <label htmlFor="tagline">Subtitle</label>
              <input id="tagline" value={p.tagline} placeholder="Short line shown under the title" onChange={(e) => set("tagline", e.target.value)} />
            </div>
            <div className="adm-field">
              <label htmlFor="desc">Description</label>
              <textarea id="desc" rows={6} value={p.description} onChange={(e) => set("description", e.target.value)} />
            </div>
          </div>

          <div className="adm-card">
            <h2>Media</h2>
            <MediaManager media={media} onChange={setMedia} onError={(m) => toast(m, true)} />
          </div>

          <div className="adm-card">
            <h2>Pricing</h2>
            <div className="adm-row">
              <div className="adm-field">
                <label>Price</label>
                <div className="adm-prefix">
                  <span>Rs</span>
                  <input type="number" min={0} value={p.price} onChange={(e) => set("price", Number(e.target.value))} />
                </div>
              </div>
              <div className="adm-field">
                <label>Compare-at price</label>
                <div className="adm-prefix">
                  <span>Rs</span>
                  <input
                    type="number"
                    min={0}
                    value={p.compare_at ?? ""}
                    onChange={(e) => set("compare_at", e.target.value ? Number(e.target.value) : null)}
                  />
                </div>
              </div>
            </div>
            <p className="adm-help" style={{ marginTop: 8 }}>
              {margin > 0
                ? `Shown on the storefront as ${formatPrice(p.price)} instead of ${formatPrice(p.compare_at!)} (${margin}% off).`
                : "Set a compare-at price higher than the price to show a sale."}
            </p>
          </div>

          <div className="adm-card adm-card--flush">
            <div className="adm-card__head" style={{ padding: "16px 16px 0" }}>
              <h2>Variants</h2>
              <button type="button" className="adm-btn adm-btn--plain" onClick={() => set("colorways", [...p.colorways, blankVariant()])}>
                + Add variant
              </button>
            </div>
            <p className="adm-help" style={{ padding: "0 16px 8px" }}>
              Each variant is a frame + lens combination with its own photo and stock.
            </p>
            <div style={{ overflowX: "auto" }}>
              <table className="adm-table adm-variants">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Frame</th>
                    <th>Lens</th>
                    <th>Colors</th>
                    <th>SKU</th>
                    <th style={{ width: 90 }}>Available</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {p.colorways.map((v: Variant, i) => {
                    const img = v.image || (i === 0 ? media[0] : "");
                    return (
                      <tr key={v.id}>
                        <td>
                          <button type="button" className="adm-vimg" title="Choose variant image" onClick={() => setPickFor(i)}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            {img ? <img src={img} alt="" /> : "+"}
                          </button>
                        </td>
                        <td>
                          <input className="adm-input" type="text" value={v.name} onChange={(e) => setVariant(i, { name: e.target.value })} />
                        </td>
                        <td>
                          <input className="adm-input" type="text" value={v.lensName} onChange={(e) => setVariant(i, { lensName: e.target.value })} />
                        </td>
                        <td style={{ whiteSpace: "nowrap" }}>
                          <input
                            type="color"
                            className="adm-swatch-in"
                            title="Frame color"
                            value={v.frameColor}
                            onChange={(e) => setVariant(i, { frameColor: e.target.value })}
                          />{" "}
                          <input
                            type="color"
                            className="adm-swatch-in"
                            title="Lens color"
                            value={v.lensColor}
                            onChange={(e) => setVariant(i, { lensColor: e.target.value })}
                          />
                        </td>
                        <td>
                          <input
                            className="adm-input"
                            type="text"
                            placeholder={p.sku ? `${p.sku}-${i + 1}` : ""}
                            value={v.sku ?? ""}
                            onChange={(e) => setVariant(i, { sku: e.target.value })}
                          />
                        </td>
                        <td>
                          <input
                            className="adm-input"
                            type="number"
                            min={0}
                            value={v.stock ?? 0}
                            onChange={(e) => setVariant(i, { stock: Math.max(0, Number(e.target.value)) })}
                          />
                        </td>
                        <td>
                          {p.colorways.length > 1 && (
                            <button
                              type="button"
                              className="adm-btn adm-btn--plain"
                              style={{ color: "#c70a24" }}
                              onClick={() => set("colorways", p.colorways.filter((_, j) => j !== i))}
                              aria-label="Remove variant"
                            >
                              Remove
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div style={{ padding: "10px 16px", borderTop: "1px solid #ebebeb" }} className="adm-muted">
              Total inventory: <strong>{draft.stock}</strong> available
            </div>
          </div>

          <div className="adm-card">
            <h2>Product details</h2>
            <div className="adm-field">
              <label>Highlights</label>
              <textarea rows={4} value={featuresText} placeholder="One per line" onChange={(e) => setFeaturesText(e.target.value)} />
              <span className="adm-help">Shown as bullet points in the Details tab. One per line.</span>
            </div>
            <div className="adm-field">
              <label>Base SKU</label>
              <input value={p.sku ?? ""} onChange={(e) => set("sku", e.target.value)} />
            </div>
          </div>

          <div className="adm-card">
            <div className="adm-card__head">
              <h2>Search engine listing</h2>
            </div>
            <div className="adm-seo">
              <p className="adm-seo__title">
                {p.name || "Product title"} – {site.name}
              </p>
              <p className="adm-seo__url">
                {site.url}/products/{handle}
              </p>
              <p className="adm-seo__desc">{(p.description || p.tagline || "Add a description to see how this product might appear in search results.").slice(0, 160)}</p>
            </div>
            <div className="adm-field" style={{ marginTop: 12 }}>
              <label>URL handle</label>
              <input
                value={p.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  set("slug", slugify(e.target.value));
                }}
              />
              {!isNew && orig && p.slug !== orig.slug && (
                <span className="adm-help">Changing the handle moves the product page to a new URL. Carts holding the old handle will drop it.</span>
              )}
            </div>
          </div>
        </div>

        <div>
          <div className="adm-card">
            <h2>Status</h2>
            <div className="adm-field">
              <select value={p.status} onChange={(e) => set("status", e.target.value)}>
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
              <span className="adm-help">
                {p.status === "active"
                  ? "Visible and purchasable on the Online Store."
                  : p.status === "draft"
                    ? "Hidden from customers until you set it to active."
                    : "Hidden and kept for your records."}
              </span>
            </div>
          </div>

          <div className="adm-card">
            <h2>Product organization</h2>
            <div className="adm-field">
              <label>Collection</label>
              <select value={p.collection ?? ""} onChange={(e) => set("collection", e.target.value || null)}>
                <option value="">None</option>
                {collections.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="adm-field">
              <label>Product type</label>
              <select value={p.silhouette} onChange={(e) => set("silhouette", e.target.value)}>
                {SILHOUETTES.map((s) => (
                  <option key={s} value={s}>
                    {s[0].toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
              <span className="adm-help">Accessory products are filtered separately from sunglasses.</span>
            </div>
            <div className="adm-field">
              <label>Vendor</label>
              <input value={p.vendor} onChange={(e) => set("vendor", e.target.value)} />
            </div>
            <div className="adm-field">
              <label>Badge</label>
              <select value={p.badge ?? ""} onChange={(e) => set("badge", e.target.value || null)}>
                {BADGES.map((b) => (
                  <option key={b} value={b}>
                    {b || "None"}
                  </option>
                ))}
              </select>
            </div>
            <div className="adm-field">
              <label>Tags</label>
              <input value={tagsText} placeholder="summer, polarized" onChange={(e) => setTagsText(e.target.value)} />
            </div>
          </div>

          <div className="adm-card">
            <h2>Reviews</h2>
            <div className="adm-row">
              <div className="adm-field">
                <label>Rating</label>
                <input type="number" min={0} max={5} step={0.1} value={p.rating} onChange={(e) => set("rating", Number(e.target.value))} />
              </div>
              <div className="adm-field">
                <label>Review count</label>
                <input type="number" min={0} value={p.review_count} onChange={(e) => set("review_count", Number(e.target.value))} />
              </div>
            </div>
          </div>

          {!isNew && (
            <div className="adm-card">
              <h2>Danger zone</h2>
              <p className="adm-help" style={{ marginBottom: 10 }}>
                Archive to hide it while keeping order history readable. Delete removes it and its uploaded images.
              </p>
              <button type="button" className="adm-btn adm-btn--critical" onClick={del}>
                Delete product
              </button>
            </div>
          )}
        </div>
      </div>

      {pickFor !== null && (
        <div className="adm-picker" onClick={() => setPickFor(null)}>
          <div className="adm-picker__box" onClick={(e) => e.stopPropagation()}>
            <div className="adm-card__head">
              <h2>Select variant image</h2>
              <button type="button" className="adm-btn adm-btn--ghost adm-btn--sm" onClick={() => setPickFor(null)}>
                Done
              </button>
            </div>
            {media.length === 0 ? (
              <p className="adm-muted">Upload images in the Media card first.</p>
            ) : (
              <div className="adm-media">
                {media.map((u) => (
                  <div
                    key={u}
                    className={`adm-media__item${p.colorways[pickFor]?.image === u ? " sel" : ""}`}
                    onClick={() => {
                      setVariant(pickFor, { image: u });
                      setPickFor(null);
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={u} alt="" />
                  </div>
                ))}
              </div>
            )}
            {p.colorways[pickFor]?.image && (
              <button
                type="button"
                className="adm-btn adm-btn--plain"
                style={{ marginTop: 10 }}
                onClick={() => {
                  setVariant(pickFor, { image: "" });
                  setPickFor(null);
                }}
              >
                Use main image instead
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="adm-splash">Loading product…</div>}>
      <Editor />
    </Suspense>
  );
}
