"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { site } from "@/lib/site";
import { formatPrice } from "@/lib/format";
import { useCart } from "./CartProvider";
import ProductImage from "./ProductImage";
import PaymentIcons from "./PaymentIcons";
import { products } from "@/lib/products";
import { IconCheck, IconShield } from "./Icons";

const EXPRESS_COST = 12.95;
const STANDARD_COST = 4.95;

export default function CheckoutClient() {
  const { lines, subtotal, clear } = useCart();
  const [method, setMethod] = useState<"standard" | "express">("standard");
  const [orderId, setOrderId] = useState<string | null>(null);

  const shipping = useMemo(() => {
    if (method === "express") return EXPRESS_COST;
    return subtotal >= site.freeShippingThreshold ? 0 : STANDARD_COST;
  }, [method, subtotal]);

  const total = subtotal + shipping;

  if (orderId) {
    const upsell = products.slice(0, 3);
    return (
      <>
        <div className="order-done">
          <span className="order-done-icon">
            <IconCheck width={30} height={30} />
          </span>
          <h1>Order confirmed</h1>
          <p>
            Thanks — order <strong>{orderId}</strong> is being packed. A
            confirmation email is on its way.
          </p>
          <Link href="/shop/" className="btn btn-dark">
            Keep shopping
          </Link>
        </div>
        <div className="order-upsell">
          <h2>Complete the look</h2>
          <ul>
            {upsell.map((p) => (
              <li key={p.slug}>
                <Link href={`/products/${p.slug}/`}>
                  <span className="sr-thumb">
                    <ProductImage product={p} uid={`up-${p.slug}`} />
                  </span>
                  <span>
                    <strong>{p.name}</strong>
                    <em>{formatPrice(p.price)}</em>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="order-done">
        <h1>Your cart is empty</h1>
        <p>Add a pair before checking out.</p>
        <Link href="/shop/" className="btn btn-dark">
          Shop sunglasses
        </Link>
      </div>
    );
  }

  return (
    <>
      <header className="page-head">
        <h1>Checkout</h1>
      </header>
      <div className="express-block">
        <span className="express-label">Express checkout</span>
        <div className="express-row">
          <button type="submit" form="checkout-form" className="express-btn express-shop">
            shop&nbsp;Pay
          </button>
          <button type="submit" form="checkout-form" className="express-btn express-paypal">
            PayPal
          </button>
          <button type="submit" form="checkout-form" className="express-btn express-gpay">
            G&nbsp;Pay
          </button>
        </div>
        <div className="divider">
          <span>or continue with</span>
        </div>
      </div>
      <div className="checkout">
        <form
          className="checkout-form"
          id="checkout-form"
          onSubmit={(e) => {
            e.preventDefault();
            // Wire your payment processor here (Stripe, Shopify, etc.),
            // then clear() + setOrderId() on success.
            const id = `ZL-${Math.floor(100000 + Math.random() * 899999)}`;
            clear();
            setOrderId(id);
          }}
        >
          <fieldset>
            <legend>Contact</legend>
            <div className="field-row">
              <label className="field field-full">
                <span>Email</span>
                <input type="email" required placeholder="you@example.com" />
              </label>
            </div>
          </fieldset>

          <fieldset>
            <legend>Shipping address</legend>
            <div className="field-row">
              <label className="field">
                <span>First name</span>
                <input required autoComplete="given-name" />
              </label>
              <label className="field">
                <span>Last name</span>
                <input required autoComplete="family-name" />
              </label>
            </div>
            <div className="field-row">
              <label className="field field-full">
                <span>Address</span>
                <input required autoComplete="street-address" placeholder="Street and number" />
              </label>
            </div>
            <div className="field-row">
              <label className="field">
                <span>City</span>
                <input required autoComplete="address-level2" />
              </label>
              <label className="field">
                <span>Postal code</span>
                <input required autoComplete="postal-code" />
              </label>
            </div>
          </fieldset>

          <fieldset>
            <legend>Delivery</legend>
            <label className={`ship-option${method === "standard" ? " active" : ""}`}>
              <input
                type="radio"
                name="shipping"
                checked={method === "standard"}
                onChange={() => setMethod("standard")}
              />
              <span>
                <strong>Standard</strong> 3–5 business days
              </span>
              <em>
                {subtotal >= site.freeShippingThreshold
                  ? "Free"
                  : formatPrice(STANDARD_COST)}
              </em>
            </label>
            <label className={`ship-option${method === "express" ? " active" : ""}`}>
              <input
                type="radio"
                name="shipping"
                checked={method === "express"}
                onChange={() => setMethod("express")}
              />
              <span>
                <strong>Express</strong> 1–2 business days
              </span>
              <em>{formatPrice(EXPRESS_COST)}</em>
            </label>
          </fieldset>

          <fieldset>
            <legend>Payment</legend>
            <div className="field-row">
              <label className="field field-full">
                <span>Card number</span>
                <input
                  required
                  inputMode="numeric"
                  placeholder="1234 5678 9012 3456"
                  autoComplete="cc-number"
                />
              </label>
            </div>
            <div className="field-row">
              <label className="field">
                <span>Expiry</span>
                <input required placeholder="MM / YY" autoComplete="cc-exp" />
              </label>
              <label className="field">
                <span>CVC</span>
                <input required inputMode="numeric" placeholder="123" autoComplete="cc-csc" />
              </label>
            </div>
          </fieldset>

          <button type="submit" className="btn btn-dark btn-lg btn-block">
            Pay {formatPrice(total)}
          </button>
          <p className="secure-note">
            <IconShield width={15} height={15} /> Encrypted &amp; secure checkout
          </p>
        </form>

        <aside className="order-summary">
          <h2>Order summary</h2>
          <ul>
            {lines.map(({ key, product, colorway, qty }) => (
              <li key={key}>
                <span className="os-thumb">
                  <ProductImage
                    product={product}
                    colorway={colorway}
                    uid={`os-${key}`}
                  />
                  <i className="os-qty">{qty}</i>
                </span>
                <span className="os-name">
                  <strong>{product.name}</strong>
                  <em>{colorway.name}</em>
                </span>
                <span className="os-price">{formatPrice(product.price * qty)}</span>
              </li>
            ))}
          </ul>
          <div className="os-row">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="os-row">
            <span>Shipping</span>
            <span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
          </div>
          <div className="os-row os-total">
            <span>Total</span>
            <strong>{formatPrice(total)}</strong>
          </div>
          <p className="os-bnpl">
            or 4 interest-free payments of {formatPrice(total / 4)} with Klarna
          </p>
          <PaymentIcons />
        </aside>
      </div>
    </>
  );
}
