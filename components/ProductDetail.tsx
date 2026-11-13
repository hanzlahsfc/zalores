"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import type { Colorway, Product } from "@/lib/types";
import ProductImage from "./ProductImage";
import { IconArrow, IconChevronLeft } from "./Icons";

/**
 * Holds the selected variant for the product page so the media gallery and
 * the product form stay in sync, the way a Shopify variant change swaps the
 * featured media.
 */
const VariantCtx = createContext<{
  colorway: Colorway;
  setColorway: (c: Colorway) => void;
} | null>(null);

export function useColorway() {
  const ctx = useContext(VariantCtx);
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
  const touchX = useRef<number | null>(null);
  const media = [undefined, ...product.gallery];

  useEffect(() => setActive(0), [colorway.id]);

  const go = (d: number) => setActive((i) => (i + d + media.length) % media.length);

  return (
    <VariantCtx.Provider value={{ colorway, setColorway }}>
      <section className="product">
        <div className="product__media-wrapper">
          <div
            className="product__media-main"
            onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
            onTouchEnd={(e) => {
              if (touchX.current === null) return;
              const dx = e.changedTouches[0].clientX - touchX.current;
              if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
              touchX.current = null;
            }}
          >
            <ProductImage
              key={`${colorway.id}-${active}`}
              product={product}
              colorway={colorway}
              src={media[active]}
              uid={`pdp-${product.slug}-${colorway.id}-${active}`}
              priority={active === 0}
            />
          </div>

          <div className="slider-buttons">
            <button type="button" className="icon-btn" aria-label="Previous slide" onClick={() => go(-1)}>
              <IconChevronLeft />
            </button>
            <span className="slider-counter">
              {active + 1} / {media.length}
            </span>
            <button type="button" className="icon-btn" aria-label="Next slide" onClick={() => go(1)}>
              <IconArrow />
            </button>
          </div>

          <ul className="thumbnail-list" role="list">
            {media.map((src, i) => (
              <li key={i}>
                <button
                  type="button"
                  className="thumbnail"
                  aria-current={active === i}
                  aria-label={`Load image ${i + 1} in gallery view`}
                  onClick={() => setActive(i)}
                >
                  <ProductImage
                    product={product}
                    colorway={colorway}
                    src={src}
                    uid={`pdp-t${i}-${product.slug}-${colorway.id}`}
                  />
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="product__info-wrapper">
          <div className="product__info-container">{children}</div>
        </div>
      </section>
    </VariantCtx.Provider>
  );
}
