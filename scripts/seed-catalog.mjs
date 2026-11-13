// One-off: push lib/products.ts into Supabase (zl_products + zl_collections).
// Usage: SUPABASE_URL=... SUPABASE_SERVICE_KEY=... node scripts/seed-catalog.mjs
import { existsSync } from "node:fs";
import { products, collections } from "../lib/products.ts";

const URL = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_KEY;
if (!URL || !KEY) throw new Error("SUPABASE_URL and SUPABASE_SERVICE_KEY are required");

const headers = {
  apikey: KEY,
  Authorization: `Bearer ${KEY}`,
  "Content-Type": "application/json",
  Prefer: "resolution=merge-duplicates",
};

const rows = products.map((p, i) => {
  const per = Math.floor(p.stock / p.colorways.length);
  const colorways = p.colorways.map((c, j) => {
    const file = `/assets/img/products/${p.slug}-${c.id}.jpg`;
    return {
      ...c,
      image: j === 0 ? p.image : existsSync(`public${file}`) ? file : "",
      stock: j === 0 ? p.stock - per * (p.colorways.length - 1) : per,
    };
  });
  return {
    slug: p.slug,
    name: p.name,
    tagline: p.tagline,
    description: p.description,
    price: p.price,
    compare_at: p.compareAt ?? null,
    collection: p.collection,
    silhouette: p.silhouette,
    tint: p.tint,
    rating: p.rating,
    review_count: p.reviewCount,
    badge: p.badge ?? null,
    stock: p.stock,
    features: p.features,
    sku: p.sku,
    image: p.image,
    gallery: p.gallery,
    colorways,
    status: "active",
    active: true,
    sort: i,
  };
});

const cols = collections.map((c, i) => ({ ...c, sort: i }));

for (const [table, body] of [["zl_products", rows], ["zl_collections", cols]]) {
  const res = await fetch(`${URL}/rest/v1/${table}`, { method: "POST", headers, body: JSON.stringify(body) });
  console.log(table, res.status, res.ok ? "" : await res.text());
}
