import { collections as staticCollections, products as staticProducts } from "./products";
import { fetchCatalogRecords } from "./catalog-map";
import type { Collection, Product } from "./types";

export interface Catalog {
  products: Product[];
  collections: Collection[];
}

let cached: Promise<Catalog> | null = null;

/**
 * Build-time catalog: the Supabase database is the source of truth (edited in
 * /admin). Falls back to the bundled lib/products.ts if the DB is unreachable,
 * so a build never ships an empty store.
 */
export function getCatalog(): Promise<Catalog> {
  cached ??= (async () => {
    const live = await fetchCatalogRecords({ cache: "no-store" });
    if (live && live.products.length) return live;
    return { products: staticProducts, collections: staticCollections };
  })();
  return cached;
}

export async function getProductBySlug(slug: string) {
  return (await getCatalog()).products.find((p) => p.slug === slug);
}

export function related(products: Product[], product: Product, count = 4) {
  const same = products.filter((p) => p.slug !== product.slug && p.collection === product.collection);
  const rest = products.filter((p) => p.slug !== product.slug && p.collection !== product.collection);
  return [...same, ...rest].slice(0, count);
}
