import type { Collection, Colorway, Product } from "./types";

/** Raw zl_products row as stored in Supabase. */
export interface ProductRecord {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  price: number;
  compare_at: number | null;
  collection: string | null;
  silhouette: string;
  tint: string;
  rating: number;
  review_count: number;
  badge: string | null;
  stock: number;
  features: string[];
  sku: string | null;
  image: string;
  gallery: string[];
  colorways: Colorway[];
  status: "active" | "draft" | "archived" | string;
  sort: number;
  tags: string[];
  vendor: string;
  created_at?: string;
  updated_at?: string;
}

export interface CollectionRecord {
  slug: string;
  name: string;
  description: string;
  image: string;
  sort: number;
}

const FALLBACK_COLORWAY: Colorway = {
  id: "default",
  name: "Default",
  frameColor: "#2b2b2b",
  lensColor: "#3a3f45",
  lensName: "Standard",
};

export function toProduct(r: ProductRecord): Product {
  const colorways = r.colorways?.length ? r.colorways : [FALLBACK_COLORWAY];
  return {
    slug: r.slug,
    name: r.name,
    tagline: r.tagline ?? "",
    description: r.description ?? "",
    price: Number(r.price),
    compareAt: r.compare_at ? Number(r.compare_at) : undefined,
    collection: r.collection ?? "",
    silhouette: (r.silhouette as Product["silhouette"]) || "aviator",
    colorways,
    tint: r.tint || "#f2f2f2",
    rating: Number(r.rating) || 0,
    reviewCount: Number(r.review_count) || 0,
    badge: r.badge || undefined,
    stock: Number(r.stock) || 0,
    features: r.features ?? [],
    sku: r.sku ?? "",
    image: r.image || colorways[0].image || "",
    gallery: r.gallery ?? [],
  };
}

export function toCollection(r: CollectionRecord): Collection {
  return { slug: r.slug, name: r.name, description: r.description ?? "", image: r.image ?? "" };
}

const URL_ = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/** Read the active catalog with the public anon key (RLS: status = active only). */
export async function fetchCatalogRecords(init?: RequestInit) {
  if (!URL_ || !ANON) return null;
  const h = { apikey: ANON, Authorization: `Bearer ${ANON}` };
  try {
    const [p, c] = await Promise.all([
      fetch(`${URL_}/rest/v1/zl_products?select=*&status=eq.active&order=sort.asc,created_at.asc`, { headers: h, ...init }),
      fetch(`${URL_}/rest/v1/zl_collections?select=*&order=sort.asc`, { headers: h, ...init }),
    ]);
    if (!p.ok || !c.ok) return null;
    return {
      products: ((await p.json()) as ProductRecord[]).map(toProduct),
      collections: ((await c.json()) as CollectionRecord[]).map(toCollection),
    };
  } catch {
    return null;
  }
}
