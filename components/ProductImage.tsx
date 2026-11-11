"use client";

import { useState } from "react";
import type { Colorway, Product } from "@/lib/types";
import ProductArt from "./ProductArt";

/**
 * Renders the real product photo when it exists in /public, with the SVG
 * product art underneath as a permanent fallback. Photos resolve in order:
 *   <slug>-<colorway-id>.jpg  →  <slug>.jpg  →  SVG art
 * Drop files into public/assets/img/products/ and they go live automatically.
 * The img only appears once it has actually loaded — a 404 never flashes a
 * broken-image icon, even before hydration.
 */
export default function ProductImage({
  product,
  src,
  uid,
  colorway,
  priority,
}: {
  product: Product;
  src?: string;
  uid: string;
  colorway?: Colorway;
  priority?: boolean;
}) {
  const [failed, setFailed] = useState<string[]>([]);
  const [loaded, setLoaded] = useState<string | null>(null);
  const cw = colorway ?? product.colorways[0];

  const candidates = [
    src,
    cw.id !== product.colorways[0].id
      ? `/assets/img/products/${product.slug}-${cw.id}.jpg`
      : undefined,
    product.image,
  ].filter((s): s is string => Boolean(s));

  const image = candidates.find((c) => !failed.includes(c));

  return (
    <span className="pimg">
      <ProductArt product={product} uid={uid} colorway={cw} />
      {image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image}
          alt={`${product.name} in ${cw.name} — ${product.tagline}`}
          loading={priority ? "eager" : "lazy"}
          onLoad={() => setLoaded(image)}
          onError={() => setFailed((f) => [...f, image])}
          className={`product-photo${loaded === image ? " show" : ""}`}
        />
      )}
    </span>
  );
}
