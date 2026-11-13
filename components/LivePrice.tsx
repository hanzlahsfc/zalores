"use client";

import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/types";
import { useLiveProduct } from "./CatalogProvider";

/** PDP price that reflects admin edits without waiting for a rebuild. */
export default function LivePrice({ product }: { product: Product }) {
  const p = useLiveProduct(product);
  const sale = Boolean(p.compareAt && p.compareAt > p.price);
  return (
    <div className="price price--large">
      {sale && <s>{formatPrice(p.compareAt!)}</s>}
      <span>{formatPrice(p.price)}</span>
      {sale && <span className="badge badge--sale">Sale</span>}
      {p.stock === 0 && <span className="badge">Sold out</span>}
    </div>
  );
}
