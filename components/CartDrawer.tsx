"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { site } from "@/lib/site";
import { formatPrice } from "@/lib/format";
import { useCart } from "./CartProvider";
import ProductImage from "./ProductImage";
import { IconCaret, IconClose, IconMinus, IconPlus, IconTrash } from "./Icons";

export default function CartDrawer() {
  const { lines, subtotal, isOpen, closeCart, setQty, remove } = useCart();
  const [noteOpen, setNoteOpen] = useState(false);
  const threshold = site.freeShippingThreshold;
  const remaining = Math.max(0, threshold - subtotal);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeCart();
    if (isOpen) window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, closeCart]);

  return (
    <>
      {isOpen && <div className="overlay drawer-overlay" onClick={closeCart} />}
      <div
        className={`drawer${isOpen ? " open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Your cart"
      >
        {lines.length === 0 ? (
          <>
            <div className="drawer__header" style={{ justifyContent: "flex-end" }}>
              <button className="icon-btn" aria-label="Close" onClick={closeCart}>
                <IconClose />
              </button>
            </div>
            <div className="drawer__empty">
              <h2>Your cart is empty</h2>
              <Link href="/shop/" className="button" onClick={closeCart}>
                Continue shopping
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="drawer__header">
              <h2>Your cart</h2>
              <button className="icon-btn" aria-label="Close" onClick={closeCart}>
                <IconClose />
              </button>
            </div>

            <div className="drawer__body">
              <div className="free-shipping">
                {remaining > 0 ? (
                  <>You are {formatPrice(remaining)} away from free shipping</>
                ) : (
                  <>Your order qualifies for free shipping</>
                )}
                <div className="free-shipping__bar">
                  <span style={{ width: `${Math.min(100, (subtotal / threshold) * 100)}%` }} />
                </div>
              </div>

              <div className="cart-items__head">
                <span>Product</span>
                <span>Total</span>
              </div>
              <ul role="list">
                {lines.map(({ key, product, colorway, qty }) => (
                  <li key={key} className="cart-item">
                    <Link
                      href={`/products/${product.slug}/`}
                      className="cart-item__media"
                      onClick={closeCart}
                      tabIndex={-1}
                    >
                      <ProductImage product={product} colorway={colorway} uid={`ct-${key}`} />
                    </Link>
                    <div>
                      <Link
                        href={`/products/${product.slug}/`}
                        className="cart-item__name"
                        onClick={closeCart}
                      >
                        {product.name}
                      </Link>
                      <div className="cart-item__price">{formatPrice(product.price)}</div>
                      {product.colorways.length > 1 && (
                        <dl className="product-option">
                          <div>
                            <dt style={{ display: "inline" }}>Frame: </dt>
                            <dd style={{ display: "inline" }}>{colorway.name}</dd>
                          </div>
                          <div>
                            <dt style={{ display: "inline" }}>Lens: </dt>
                            <dd style={{ display: "inline" }}>{colorway.lensName}</dd>
                          </div>
                        </dl>
                      )}
                      <div className="cart-item__quantity">
                        <div className="quantity quantity--sm">
                          <button aria-label={`Decrease quantity for ${product.name}`} onClick={() => setQty(key, qty - 1)}>
                            <IconMinus />
                          </button>
                          <span>{qty}</span>
                          <button aria-label={`Increase quantity for ${product.name}`} onClick={() => setQty(key, Math.min(10, qty + 1))}>
                            <IconPlus />
                          </button>
                        </div>
                        <button className="icon-btn" aria-label={`Remove ${product.name}`} onClick={() => remove(key)}>
                          <IconTrash />
                        </button>
                      </div>
                    </div>
                    <div className="cart-item__total">{formatPrice(product.price * qty)}</div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="drawer__footer">
              <button
                type="button"
                className="cart-note__toggle"
                onClick={() => setNoteOpen((v) => !v)}
                aria-expanded={noteOpen}
              >
                Order special instructions
                <IconCaret style={{ transform: noteOpen ? "rotate(180deg)" : undefined }} />
              </button>
              {noteOpen && (
                <div className="field cart-note__field">
                  <textarea id="CartNote" className="field__input" placeholder=" " rows={2} />
                  <label className="field__label" htmlFor="CartNote">
                    Order special instructions
                  </label>
                </div>
              )}
              <div className="totals">
                <h3>Estimated total</h3>
                <span className="totals__value">{formatPrice(subtotal)} PKR</span>
              </div>
              <p className="tax-note">
                Taxes, discounts and{" "}
                <Link href="/policies/shipping-returns/" className="link" onClick={closeCart}>
                  shipping
                </Link>{" "}
                calculated at checkout.
              </p>
              <Link href="/checkout/" className="button button--full" onClick={closeCart}>
                Check out
              </Link>
            </div>
          </>
        )}
      </div>
    </>
  );
}
