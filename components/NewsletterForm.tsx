"use client";

import { useId, useState } from "react";
import { subscribeNewsletter } from "@/lib/forms";
import { IconArrow, IconCheck } from "./Icons";

export default function NewsletterForm() {
  const id = useId();
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);

  return (
    <form
      className="newsletter-form"
      onSubmit={async (e) => {
        e.preventDefault();
        if (busy || done) return;
        setBusy(true);
        setError(false);
        const ok = await subscribeNewsletter(email);
        setBusy(false);
        if (ok) setDone(true);
        else setError(true);
      }}
    >
      <div className="field">
        <input
          id={id}
          type="email"
          required
          className="field__input"
          placeholder=" "
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <label className="field__label" htmlFor={id}>
          Email
        </label>
        <button type="submit" className="field__button" aria-label="Subscribe" disabled={busy}>
          <IconArrow />
        </button>
      </div>
      {done && (
        <p className="form-message">
          <IconCheck /> Thanks for subscribing. Use WELCOME10 for 10% off your first order.
        </p>
      )}
      {error && (
        <p className="form-error" style={{ marginTop: 10 }}>
          Something went wrong. Please try again.
        </p>
      )}
    </form>
  );
}
