"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { site } from "@/lib/site";
import { formatPrice } from "@/lib/format";
import { useCart } from "./CartProvider";
import ProductImage from "./ProductImage";
import PaymentIcons from "./PaymentIcons";
import { IconClose, IconMinus, IconPlus, IconTruck } from "./Icons";

export default function CartDrawer() {
  const { lines, subtotal, isOpen, closeCart, setQty, remove } = useCart();
  const [noteOpen, setNoteOpen] = useState(false);
  const threshold = site.freeShippingThreshold;
  const remaining = Math.max(0, threshold - subtotal);
  const progress = Math.min(100, (subtotal / threshold) * 100);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      {isOpen && <div className="scrim" onClick={closeCart} />}
      <aside
        className={`cart-drawer${isOpen ? " open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
      >
        <div className="cart-head">
          <h2>Your cart</h2>
          <button className="icon-btn" aria-label="Close cart" onClick={closeCart}>
            <IconClose width={22} height={22} />
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="cart-empty">
            <p>Your cart is empty.</p>
            <Link href="/shop/" className="btn btn-dark" onClick={closeCart}>
              Shop the collection
            </Link>
          </div>
        ) : (
          <>
            <div className="ship-progress">
              <p>
                {remaining > 0 ? (
                  <>
                    You&rsquo;re <strong>{formatPrice(remaining)}</strong> away
                    from free shipping
                  </>
                ) : (
                  <>
                    <IconTruck width={16} height={16} /> You&rsquo;ve unlocked
                    free shipping
                  </>
                )}
              </p>
              <div className="ship-bar">
                <span style={{ width: `${progress}%` }} />
              </div>
            </div>

            <ul className="cart-lines">
              {lines.map(({ key, product, colorway, qty }) => (
                <li key={key} className="cart-line">
                  <Link
                    href={`/products/${product.slug}/`}
                    className="cart-thumb"
                    onClick={closeCart}
                  >
                    <ProductImage
                      product={product}
                      colorway={colorway}
                      uid={`ct-${key}`}
                    />
                  </Link>
                  <div className="cart-line-info">
                    <Link
                      href={`/products/${product.slug}/`}
                      className="cart-line-name"
                      onClick={closeCart}
                    >
                      {product.name}
                    </Link>
                    <span className="cart-line-meta">
                      {colorway.name} · {colorway.lensName}
                    </span>
                    <div className="qty-stepper">
                      <button
                        aria-label="Decrease quantity"
                        onClick={() => setQty(key, qty - 1)}
                      >
                        <IconMinus width={14} height={14} />
                      </button>
                      <span>{qty}</span>
                      <button
                        aria-label="Increase quantity"
                        onClick={() => setQty(key, qty + 1)}
                      >
                        <IconPlus width={14} height={14} />
                      </button>
                    </div>
                  </div>
                  <div className="cart-line-right">
                    <span className="cart-line-price">
                      {formatPrice(product.price * qty)}
                    </span>
                    <button className="link-quiet" onClick={() => remove(key)}>
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <div className="cart-foot">
              <button
                className="cart-note-toggle"
                onClick={() => setNoteOpen((v) => !v)}
                aria-expanded={noteOpen}
              >
                {noteOpen ? "Hide order note" : "Add an order note"}
              </button>
              {noteOpen && (
                <textarea
                  className="cart-note"
                  rows={2}
                  placeholder="Special instructions for your order"
                />
              )}
              <div className="cart-total-row">
                <span>Subtotal</span>
                <strong>{formatPrice(subtotal)}</strong>
              </div>
              <p className="cart-note">
                Tax included. Shipping, taxes, and discount codes calculated at
                checkout.
              </p>
              <Link
                href="/checkout/"
                className="btn btn-dark btn-block"
                onClick={closeCart}
              >
                Check out
              </Link>
              <PaymentIcons />
              <button className="link-quiet cart-continue" onClick={closeCart}>
                or continue shopping
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
