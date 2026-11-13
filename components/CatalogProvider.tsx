"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { fetchCatalogRecords } from "@/lib/catalog-map";
import type { Catalog } from "@/lib/catalog";
import type { Product } from "@/lib/types";

interface Ctx extends Catalog {
  getProduct: (slug: string) => Product | undefined;
}

const CatalogCtx = createContext<Ctx | null>(null);

/**
 * Ships the build-time catalog to the client, then refreshes it from the
 * database on load so prices, stock and sold-out states are always live.
 */
export function CatalogProvider({ initial, children }: { initial: Catalog; children: React.ReactNode }) {
  const [catalog, setCatalog] = useState(initial);

  useEffect(() => {
    let alive = true;
    fetchCatalogRecords().then((live) => {
      if (alive && live && live.products.length) setCatalog(live);
    });
    return () => {
      alive = false;
    };
  }, []);

  const value = useMemo<Ctx>(
    () => ({ ...catalog, getProduct: (slug) => catalog.products.find((p) => p.slug === slug) }),
    [catalog],
  );
  return <CatalogCtx.Provider value={value}>{children}</CatalogCtx.Provider>;
}

export function useCatalog() {
  const ctx = useContext(CatalogCtx);
  if (!ctx) throw new Error("useCatalog must be used inside CatalogProvider");
  return ctx;
}

/** Live version of a server-rendered product (falls back to the prop). */
export function useLiveProduct(product: Product) {
  const { getProduct } = useCatalog();
  return getProduct(product.slug) ?? product;
}
