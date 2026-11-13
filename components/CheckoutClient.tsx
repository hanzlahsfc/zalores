"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { site } from "@/lib/site";
import { formatPrice } from "@/lib/format";
import { useCart, type CartLine } from "./CartProvider";
import ProductImage from "./ProductImage";
import PaymentIcons from "./PaymentIcons";
import { IconBag, IconCaret, IconCheck, IconLock } from "./Icons";

const { standard: STANDARD, express: EXPRESS } = site.shipping;
const CODES: Record<string, number> = { WELCOME10: 0.1 };
const PROVINCES = [
  "Punjab", "Sindh", "Khyber Pakhtunkhwa", "Balochistan",
  "Gilgit-Baltistan", "Azad Jammu & Kashmir", "Islamabad Capital Territory",
];

interface Placed {
  id: string;
  email: string;
  first: string;
  address: string[];
  method: string;
  lines: CartLine[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
}

function Field({
  id,
  label,
  className,
  icon,
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; icon?: React.ReactNode }) {
  return (
    <div className={`co-field${className ? ` ${className}` : ""}`}>
      <input id={id} placeholder={label} {...rest} />
      <label htmlFor={id}>{label}</label>
      {icon}
    </div>
  );
}

function Summary({
  lines,
  subtotal,
  discount,
  shipping,
  total,
  codeUi,
}: {
  lines: CartLine[];
  subtotal: number;
  discount: number;
  shipping: number | null;
  total: number;
  codeUi?: React.ReactNode;
}) {
  return (
    <>
      <ul className="co-lines" role="list">
        {lines.map(({ key, product, colorway, qty }) => (
          <li key={key} className="co-line">
            <span className="co-line__thumb">
              <ProductImage product={product} colorway={colorway} uid={`co-${key}`} />
              <span className="co-line__qty">{qty}</span>
            </span>
            <span>
              <span className="co-line__name">{product.name}</span>
              {product.colorways.length > 1 && (
                <span className="co-line__variant">
                  {colorway.name} / {colorway.lensName}
                </span>
              )}
            </span>
            <span>{formatPrice(product.price * qty)}</span>
          </li>
        ))}
      </ul>
      {codeUi}
      <div className="co-rows" style={codeUi ? undefined : { marginTop: 22 }}>
        <div className="co-row">
          <span>Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        {discount > 0 && (
          <div className="co-row">
            <span>Discount</span>
            <span>-{formatPrice(discount)}</span>
          </div>
        )}
        <div className={`co-row${shipping === null ? " co-row--muted" : ""}`}>
          <span>Shipping</span>
          <span>
            {shipping === null ? "Enter shipping address" : shipping === 0 ? "FREE" : formatPrice(shipping)}
          </span>
        </div>
        <div className="co-row co-row--total">
          <span>Total</span>
          <span>
            <small>PKR</small>
            {formatPrice(total)}
          </span>
        </div>
      </div>
    </>
  );
}

export default function CheckoutClient() {
  const { lines, subtotal, clear } = useCart();
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [method, setMethod] = useState<"standard" | "express">("standard");
  const [payment, setPayment] = useState<"cod" | "card" | "bank">("cod");
  const [address, setAddress] = useState("");
  const [code, setCode] = useState("");
  const [applied, setApplied] = useState<string | null>(null);
  const [codeError, setCodeError] = useState(false);
  const [placed, setPlaced] = useState<Placed | null>(null);

  const discount = applied ? Math.round(subtotal * CODES[applied] * 100) / 100 : 0;
  const freeStandard = subtotal - discount >= site.freeShippingThreshold;
  const shipping = useMemo(() => {
    if (!address.trim()) return null;
    return method === "express" ? EXPRESS : freeStandard ? 0 : STANDARD;
  }, [address, method, freeStandard]);
  const total = subtotal - discount + (shipping ?? 0);

  const applyCode = () => {
    const c = code.trim().toUpperCase();
    if (CODES[c]) {
      setApplied(c);
      setCodeError(false);
      setCode("");
    } else setCodeError(true);
  };

  const header = (
    <header className="co-header">
      <div className="co-header__inner">
        <div className="co-header__left">
          <div>
            <Link href="/" className="co-logo" style={{ color: "#000" }}>
              {site.name}
            </Link>
            <Link href="/shop/" className="co-bag co-bag--mobile" aria-label="Cart">
              <IconBag />
            </Link>
          </div>
        </div>
        <div className="co-header__right">
          <div>
            <Link href="/shop/" className="co-bag" aria-label="Cart">
              <IconBag />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );

  const footer = (
    <footer className="co-footer">
      <Link href="/policies/shipping-returns/">Refund policy</Link>
      <Link href="/policies/shipping-returns/">Shipping policy</Link>
      <Link href="/policies/privacy/">Privacy policy</Link>
      <Link href="/policies/terms/">Terms of service</Link>
      <Link href="/contact/">Contact information</Link>
    </footer>
  );

  const shown = placed ?? { lines, subtotal, discount, shipping, total };

  const toggle = (
    <button
      type="button"
      className="co-summary-toggle"
      aria-expanded={summaryOpen}
      onClick={() => setSummaryOpen((v) => !v)}
    >
      <span>
        {summaryOpen ? "Hide order summary" : "Show order summary"} <IconCaret />
      </span>
      <strong>{formatPrice(shown.total)}</strong>
    </button>
  );

  if (!placed && lines.length === 0) {
    return (
      <div className="co">
        {header}
        <div className="co-left__inner co-empty" style={{ margin: "0 auto", padding: "60px 21px" }}>
          <h2>Your cart is empty</h2>
          <p>Add something to your cart before checking out.</p>
          <Link href="/shop/" className="co-pay" style={{ display: "inline-flex", width: "auto", padding: "0 28px", alignItems: "center", textDecoration: "none", color: "#fff" }}>
            Continue shopping
          </Link>
        </div>
      </div>
    );
  }

  if (placed) {
    return (
      <div className="co">
        {header}
        {toggle}
        <div className="co-main">
          <div className="co-left">
            <div className="co-left__inner">
              <div className="co-thanks__head">
                <svg viewBox="0 0 50 50" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="25" cy="25" r="23" />
                  <path d="M15 25.5l7 7 13-14" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div>
                  <small>Confirmation #{placed.id}</small>
                  <h2>Thank you{placed.first ? `, ${placed.first}` : ""}!</h2>
                </div>
              </div>
              <div className="co-box">
                <h3>Your order is confirmed</h3>
                <p>You&rsquo;ll receive a confirmation email with your order number shortly.</p>
              </div>
              <div className="co-box">
                <h3>Order details</h3>
                <div className="co-details">
                  <div>
                    <h4>Contact information</h4>
                    <p>{placed.email}</p>
                  </div>
                  <div>
                    <h4>Payment method</h4>
                    <p>{payment === "card" ? "Debit/Credit card" : payment === "bank" ? "Bank transfer" : "Cash on Delivery"} · {formatPrice(placed.total)}</p>
                  </div>
                  <div>
                    <h4>Shipping address</h4>
                    {placed.address.map((l, i) => (
                      <p key={i}>{l}</p>
                    ))}
                  </div>
                  <div>
                    <h4>Shipping method</h4>
                    <p>{placed.method}</p>
                  </div>
                </div>
              </div>
              <div className="co-thanks__actions">
                <span>
                  Need help? <Link href="/contact/">Contact us</Link>
                </span>
                <Link href="/shop/" className="co-pay" style={{ color: "#fff", textDecoration: "none" }}>
                  Continue shopping
                </Link>
              </div>
              {footer}
            </div>
          </div>
          <aside className={`co-right${summaryOpen ? " open" : ""}`}>
            <div className="co-right__inner">
              <Summary {...placed} shipping={placed.shipping} />
            </div>
          </aside>
        </div>
      </div>
    );
  }

  return (
    <div className="co">
      {header}
      {toggle}
      <div className="co-main">
        <div className="co-left">
          <div className="co-left__inner">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                // UI only: connect a payment processor here, then record the order.
                const f = new FormData(e.currentTarget);
                const g = (k: string) => String(f.get(k) ?? "").trim();
                const placedOrder: Placed = {
                  id: Math.random().toString(36).slice(2, 11).toUpperCase(),
                  email: g("email"),
                  first: g("first"),
                  address: [
                    `${g("first")} ${g("last")}`.trim(),
                    [g("address"), g("apt")].filter(Boolean).join(", "),
                    `${g("city")}, ${g("province")} ${g("postal")}`.trim(),
                    "Pakistan",
                  ].filter(Boolean),
                  method: method === "express" ? "Express (1 to 2 working days)" : "Standard (3 to 5 working days)",
                  lines,
                  subtotal,
                  discount,
                  shipping: shipping ?? 0,
                  total,
                };
                setPlaced(placedOrder);
                clear();
                window.scrollTo(0, 0);
              }}
            >
              <section className="co-section">
                <div className="co-section__head">
                  <h2>Contact</h2>
                </div>
                <Field id="email" name="email" type="email" label="Email" required autoComplete="email" />
                <label className="co-check">
                  <input type="checkbox" defaultChecked /> Email me with news and offers
                </label>
              </section>

              <section className="co-section">
                <div className="co-section__head">
                  <h2>Delivery</h2>
                </div>
                <div className="co-fields">
                  <div className="co-field">
                    <select id="country" name="country" defaultValue="Pakistan">
                      <option>Pakistan</option>
                    </select>
                    <label htmlFor="country">Country/Region</label>
                    <IconCaret />
                  </div>
                  <div className="co-fields co-fields--2">
                    <Field id="first" name="first" label="First name (optional)" autoComplete="given-name" />
                    <Field id="last" name="last" label="Last name" required autoComplete="family-name" />
                  </div>
                  <Field
                    id="address"
                    name="address"
                    label="Address"
                    required
                    autoComplete="address-line1"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                  <Field id="apt" name="apt" label="Apartment, suite, etc. (optional)" autoComplete="address-line2" />
                  <div className="co-fields co-fields--3">
                    <Field id="city" name="city" label="City" required autoComplete="address-level2" />
                    <div className="co-field">
                      <select id="province" name="province" required defaultValue="">
                        <option value="" disabled></option>
                        {PROVINCES.map((p) => (
                          <option key={p}>{p}</option>
                        ))}
                      </select>
                      <label htmlFor="province">Province</label>
                      <IconCaret />
                    </div>
                    <Field id="postal" name="postal" label="Postal code (optional)" inputMode="numeric" autoComplete="postal-code" />
                  </div>
                  <Field id="phone" name="phone" type="tel" label="Phone" required autoComplete="tel" />
                </div>
                <label className="co-check">
                  <input type="checkbox" /> Save this information for next time
                </label>
              </section>

              <section className="co-section">
                <div className="co-section__head">
                  <h2 style={{ fontSize: 17 }}>Shipping method</h2>
                </div>
                {shipping === null ? (
                  <p className="co-notice">Enter your shipping address to view available shipping methods.</p>
                ) : (
                  <div className="co-options">
                    <label className={`co-option${method === "standard" ? " active" : ""}`}>
                      <input type="radio" name="method" checked={method === "standard"} onChange={() => setMethod("standard")} />
                      <span className="co-option__label">
                        Standard
                        <small>3 to 5 working days</small>
                      </span>
                      <span className="co-option__price">{freeStandard ? "FREE" : formatPrice(STANDARD)}</span>
                    </label>
                    <label className={`co-option${method === "express" ? " active" : ""}`}>
                      <input type="radio" name="method" checked={method === "express"} onChange={() => setMethod("express")} />
                      <span className="co-option__label">
                        Express
                        <small>1 to 2 working days, major cities</small>
                      </span>
                      <span className="co-option__price">{formatPrice(EXPRESS)}</span>
                    </label>
                  </div>
                )}
              </section>

              <section className="co-section">
                <div className="co-section__head">
                  <h2>Payment</h2>
                </div>
                <p className="co-section__sub">All transactions are secure and encrypted.</p>
                <div className="co-options">
                  <label className={`co-option${payment === "cod" ? " active" : ""}`}>
                    <input type="radio" name="payment" checked={payment === "cod"} onChange={() => setPayment("cod")} />
                    <span className="co-option__label">
                      Cash on Delivery (COD)
                      <small>Pay in cash when your order arrives. We will call to confirm.</small>
                    </span>
                  </label>
                  <label className={`co-option${payment === "card" ? " active" : ""}`}>
                    <input type="radio" name="payment" checked={payment === "card"} onChange={() => setPayment("card")} />
                    <span className="co-option__label">Debit/Credit card</span>
                    <PaymentIcons only={["Visa", "Mastercard"]} />
                  </label>
                  {payment === "card" && (
                    <div className="co-card-fields">
                      <Field id="cc" label="Card number" required inputMode="numeric" autoComplete="cc-number" icon={<IconLock />} />
                      <div className="co-fields co-fields--2">
                        <Field id="exp" label="Expiration date (MM / YY)" required autoComplete="cc-exp" />
                        <Field id="cvc" label="Security code" required inputMode="numeric" autoComplete="cc-csc" />
                      </div>
                      <Field id="ccname" label="Name on card" required autoComplete="cc-name" />
                      <label className="co-check" style={{ marginTop: 0 }}>
                        <input type="checkbox" defaultChecked /> Use shipping address as billing address
                      </label>
                    </div>
                  )}
                  <label className={`co-option${payment === "bank" ? " active" : ""}`}>
                    <input type="radio" name="payment" checked={payment === "bank"} onChange={() => setPayment("bank")} />
                    <span className="co-option__label">
                      Bank transfer
                      <small>Account details are shared on the confirmation page and by SMS.</small>
                    </span>
                  </label>
                </div>
              </section>

              <button type="submit" className="co-pay">
                {payment === "card" ? "Pay now" : "Complete order"}
              </button>
            </form>
            {footer}
          </div>
        </div>

        <aside className={`co-right${summaryOpen ? " open" : ""}`}>
          <div className="co-right__inner">
            <Summary
              lines={lines}
              subtotal={subtotal}
              discount={discount}
              shipping={shipping}
              total={total}
              codeUi={
                <div className="co-discount">
                  <Field
                    id="discount"
                    label="Discount code or gift card"
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value);
                      setCodeError(false);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        applyCode();
                      }
                    }}
                  />
                  <button
                    type="button"
                    className={`co-discount__apply${code.trim() ? " ready" : ""}`}
                    onClick={applyCode}
                    disabled={!code.trim()}
                  >
                    Apply
                  </button>
                  {codeError && <p className="co-discount__msg err">Enter a valid discount code or gift card</p>}
                  {applied && (
                    <p className="co-discount__msg ok" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <IconCheck width={14} height={14} /> {applied} applied
                      <button type="button" onClick={() => setApplied(null)} style={{ color: "#1773b0", marginLeft: 6, textDecoration: "underline" }}>
                        Remove
                      </button>
                    </p>
                  )}
                </div>
              }
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
