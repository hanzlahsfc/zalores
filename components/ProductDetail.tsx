"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { Colorway, Product } from "@/lib/types";
import ProductImage from "./ProductImage";
import ProductArt from "./ProductArt";

/**
 * Holds the selected colorway for the whole product detail view so the
 * gallery, swatch picker and buy box stay in sync — like a Shopify
 * variant selector updating media + options together.
 */

const ColorwayCtx = createContext<{
  colorway: Colorway;
  setColorway: (c: Colorway) => void;
} | null>(null);

export function useColorway() {
  const ctx = useContext(ColorwayCtx);
  if (!ctx) throw new Error("useColorway outside ProductDetail");
  return ctx;
}

export default function ProductDetail({
  product,
  children,
}: {
  product: Product;
  children: ReactNode;
}) {
  const [colorway, setColorway] = useState(product.colorways[0]);
  const [active, setActive] = useState(0);

  const media = [product.image, ...product.gallery];

  return (
    <ColorwayCtx.Provider value={{ colorway, setColorway }}>
      <div className="pdp">
        <div className="pdp-gallery">
          <div className="pdp-main">
            {product.badge && (
              <span
                className={`badge badge-${product.badge
                  .toLowerCase()
                  .replace(" ", "-")}`}
              >
                {product.badge}
              </span>
            )}
            {active === 0 ? (
              <ProductImage
                key={colorway.id}
                product={product}
                colorway={colorway}
                uid={`pdp-${product.slug}-${colorway.id}`}
                priority
              />
            ) : (
              <ProductImage
                product={product}
                colorway={colorway}
                src={media[active]}
                uid={`pdp-g${active}-${product.slug}`}
              />
            )}
          </div>
          <div className="pdp-thumbs">
            {media.map((_, i) => (
              <button
                key={i}
                className={`pdp-thumb${active === i ? " active" : ""}`}
                style={{ background: product.tint }}
                onClick={() => setActive(i)}
                aria-label={`View image ${i + 1}`}
              >
                <ProductArt
                  product={product}
                  colorway={colorway}
                  uid={`pdp-t${i}-${product.slug}-${colorway.id}`}
                />
              </button>
            ))}
          </div>
        </div>

        <div className="pdp-info">{children}</div>
      </div>
    </ColorwayCtx.Provider>
  );
}
