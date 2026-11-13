"use client";

import { useEffect, useRef, useState } from "react";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import { useCart } from "./CartProvider";
import { useColorway } from "./ProductDetail";
import { IconCheck, IconMinus, IconPlus } from "./Icons";

const unique = (xs: string[]) => [...new Set(xs)];

export default function ProductBuy({ product }: { product: Product }) {
  const { add } = useCart();
  const { colorway, setColorway } = useColorway();
  const [qty, setQty] = useState(1);
  const [sticky, setSticky] = useState(false);
  const buttonsRef = useRef<HTMLDivElement>(null);

  const frames = unique(product.colorways.map((c) => c.name));
  const lenses = unique(product.colorways.map((c) => c.lensName));
  const soldOut = product.stock === 0;
  const multiLens = frames.some(
    (f) => product.colorways.filter((c) => c.name === f).length > 1
  );

  useEffect(() => {
    const el = buttonsRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) =>
      setSticky(!e.isIntersecting && e.boundingClientRect.top < 0)
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const pickFrame = (frame: string) =>
    setColorway(
      product.colorways.find((c) => c.name === frame && c.lensName === colorway.lensName) ??
        product.colorways.find((c) => c.name === frame)!
    );
  const pickLens = (lens: string) =>
    setColorway(
      product.colorways.find((c) => c.lensName === lens && c.name === colorway.name) ??
        product.colorways.find((c) => c.lensName === lens)!
    );

  const handleAdd = () => add(product.slug, colorway.id, qty);
  const handleBuyNow = () => {
    add(product.slug, colorway.id, qty);
    window.location.href = "/checkout/";
  };

  return (
    <>
      {product.colorways.length > 1 && (
        <>
          <fieldset className="product-form__input">
            <legend>
              {multiLens ? "Frame" : "Color"}: <strong>{colorway.name}</strong>
            </legend>
            <div className="pills" role="radiogroup">
              {frames.map((f) => {
                const cw = product.colorways.find((c) => c.name === f)!;
                return (
                  <button
                    key={f}
                    type="button"
                    role="radio"
                    aria-checked={f === colorway.name}
                    className="pill"
                    onClick={() => pickFrame(f)}
                  >
                    <span className="swatch-dot" style={{ background: cw.frameColor }} />
                    {f}
                  </button>
                );
              })}
            </div>
            {!multiLens && (
              <p className="caption" style={{ marginTop: 10 }}>
                Lens: {colorway.lensName}
              </p>
            )}
          </fieldset>
          {multiLens && lenses.length > 1 && (
            <fieldset className="product-form__input">
              <legend>
                Lens: <strong>{colorway.lensName}</strong>
              </legend>
              <div className="pills" role="radiogroup">
                {lenses.map((l) => {
                  const available = product.colorways.some(
                    (c) => c.lensName === l && c.name === colorway.name
                  );
                  return (
                    <button
                      key={l}
                      type="button"
                      role="radio"
                      aria-checked={l === colorway.lensName}
                      className={`pill${available ? "" : " unavailable"}`}
                      onClick={() => pickLens(l)}
                    >
                      {l}
                      {!available && <span className="visually-hidden"> (not available in {colorway.name})</span>}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          )}
        </>
      )}

      <div style={{ marginTop: 20 }}>
        <span className="form__label">Quantity</span>
        <div className="quantity">
          <button type="button" aria-label={`Decrease quantity for ${product.name}`} onClick={() => setQty((q) => Math.max(1, q - 1))}>
            <IconMinus />
          </button>
          <span aria-live="polite">{qty}</span>
          <button type="button" aria-label={`Increase quantity for ${product.name}`} onClick={() => setQty((q) => Math.min(10, q + 1))}>
            <IconPlus />
          </button>
        </div>
      </div>

      <div className="product-form__buttons" ref={buttonsRef}>
        <button type="button" className="button button--secondary" onClick={handleAdd} disabled={soldOut}>
          {soldOut ? "Sold out" : "Add to cart"}
        </button>
        {!soldOut && (
          <button type="button" className="button" onClick={handleBuyNow}>
            Buy it now
          </button>
        )}
      </div>

      <div className="pickup-availability">
        <IconCheck />
        <div>
          <p>
            Pickup available at <strong>Zalores Studio, Lahore</strong>
          </p>
          <small>Usually ready in 24 hours</small>
          <a href="/contact/" className="link">
            View store information
          </a>
        </div>
      </div>

      <div className={`sticky-atc${sticky ? " show" : ""}`} aria-hidden={!sticky}>
        <div className="sticky-atc__info">
          <strong>{product.name}</strong>
          {product.colorways.length > 1 ? `${colorway.name} / ${colorway.lensName} · ` : ""}
          {formatPrice(product.price)}
        </div>
        <button type="button" className="button" onClick={handleAdd} disabled={soldOut} tabIndex={sticky ? 0 : -1}>
          Add to cart
        </button>
      </div>
    </>
  );
}
