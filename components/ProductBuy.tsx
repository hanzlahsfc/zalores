"use client";

import { useEffect, useRef, useState } from "react";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import { useCart } from "./CartProvider";
import { useColorway } from "./ProductDetail";
import ProductImage from "./ProductImage";
import PaymentIcons from "./PaymentIcons";
import {
  IconBag,
  IconCheck,
  IconMinus,
  IconPlus,
  IconTruck,
} from "./Icons";

export default function ProductBuy({ product }: { product: Product }) {
  const { add } = useCart();
  const { colorway, setColorway } = useColorway();
  const [qty, setQtyLocal] = useState(1);
  const [added, setAdded] = useState(false);
  const [sticky, setSticky] = useState(false);
  const [shared, setShared] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Shopify-style sticky buy bar once the main buy box scrolls out of view
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => setSticky(!e.isIntersecting),
      { rootMargin: "-80px 0px 0px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const handleAdd = () => {
    add(product.slug, colorway.id, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const handleBuyNow = () => {
    add(product.slug, colorway.id, qty);
    window.location.href = "/checkout/";
  };

  const share = async () => {
    const url = `${window.location.origin}/products/${product.slug}/`;
    if (navigator.share) {
      try {
        await navigator.share({ title: product.name, url });
        return;
      } catch {
        /* dismissed */
      }
    }
    await navigator.clipboard.writeText(url);
    setShared(true);
    setTimeout(() => setShared(false), 1600);
  };

  return (
    <>
      {/* variant picker */}
      <div className="option-block">
        <span className="option-label">
          Color: <strong>{colorway.name}</strong>
        </span>
        <div className="swatch-row" role="radiogroup" aria-label="Color">
          {product.colorways.map((c) => (
            <button
              key={c.id}
              role="radio"
              aria-checked={c.id === colorway.id}
              title={`${c.name} · ${c.lensName}`}
              className={`swatch-btn${c.id === colorway.id ? " active" : ""}`}
              onClick={() => setColorway(c)}
            >
              <i
                className="swatch swatch-lg"
                style={{ background: c.frameColor }}
              />
            </button>
          ))}
        </div>
      </div>

      <dl className="pdp-meta">
        <div>
          <dt>Lens</dt>
          <dd>
            <i className="swatch" style={{ background: colorway.lensColor }} />
            {colorway.lensName}
          </dd>
        </div>
        <div>
          <dt>SKU</dt>
          <dd>
            {product.sku}-{colorway.id.toUpperCase()}
          </dd>
        </div>
      </dl>

      <div ref={sentinelRef} />

      {/* qty + buttons */}
      <div className="buy-row">
        <div className="qty-stepper qty-lg">
          <button
            aria-label="Decrease quantity"
            onClick={() => setQtyLocal((q) => Math.max(1, q - 1))}
          >
            <IconMinus width={15} height={15} />
          </button>
          <span>{qty}</span>
          <button
            aria-label="Increase quantity"
            onClick={() => setQtyLocal((q) => Math.min(10, q + 1))}
          >
            <IconPlus width={15} height={15} />
          </button>
        </div>
        <button
          className="btn btn-dark buy-atc"
          onClick={handleAdd}
          disabled={product.stock === 0}
        >
          {added ? (
            <>
              <IconCheck width={17} height={17} /> Added
            </>
          ) : (
            <>
              <IconBag width={17} height={17} /> Add to cart
            </>
          )}
        </button>
      </div>
      <button className="btn btn-ghost btn-block buy-now" onClick={handleBuyNow}>
        Buy it now
      </button>
      <p className="bnpl-line">
        or 4 interest-free payments of {formatPrice(product.price / 4)}
      </p>

      <PaymentIcons />

      <p className="pickup-line">
        <IconTruck width={16} height={16} />
        Pickup available at Zalores Studio, usually ready in 24 hours
      </p>

      <button className="link-quiet share-btn" onClick={share}>
        {shared ? "Link copied" : "Share"}
      </button>

      {/* sticky buy bar */}
      <div className={`sticky-buy${sticky ? " show" : ""}`}>
        <span className="sticky-thumb">
          <ProductImage
            product={product}
            colorway={colorway}
            uid={`st-${product.slug}-${colorway.id}`}
          />
        </span>
        <span className="sticky-info">
          <strong>{product.name}</strong>
          <em>
            {colorway.name} · {formatPrice(product.price)}
          </em>
        </span>
        <button className="btn btn-dark" onClick={handleAdd}>
          Add to cart · {formatPrice(product.price * qty)}
        </button>
      </div>
    </>
  );
}
