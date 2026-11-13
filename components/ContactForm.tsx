"use client";

import { useState } from "react";
import { submitContact } from "@/lib/forms";
import { IconCheck } from "./Icons";

export default function ContactForm() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);

  if (sent)
    return (
      <p className="form-message" role="status">
        <IconCheck /> Thanks for contacting us. We&rsquo;ll get back to you as soon as possible.
      </p>
    );

  return (
    <form
      className="contact-form"
      onSubmit={async (e) => {
        e.preventDefault();
        if (busy) return;
        setBusy(true);
        setError(false);
        const f = new FormData(e.currentTarget);
        const phone = String(f.get("phone") ?? "").trim();
        const ok = await submitContact({
          name: String(f.get("name")),
          email: String(f.get("email")),
          subject: "Contact form",
          message: `${String(f.get("message"))}${phone ? `\n\nPhone: ${phone}` : ""}`,
        });
        setBusy(false);
        if (ok) setSent(true);
        else setError(true);
      }}
    >
      {/* honeypot, bots fill it, humans never see it */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hp-field" aria-hidden="true" />
      <div className="field-row">
        <div className="field">
          <input id="ContactForm-name" name="name" className="field__input" placeholder=" " required autoComplete="name" />
          <label className="field__label" htmlFor="ContactForm-name">Name</label>
        </div>
        <div className="field">
          <input id="ContactForm-email" name="email" type="email" className="field__input" placeholder=" " required autoComplete="email" />
          <label className="field__label" htmlFor="ContactForm-email">Email *</label>
        </div>
      </div>
      <div className="field">
        <input id="ContactForm-phone" name="phone" type="tel" className="field__input" placeholder=" " autoComplete="tel" />
        <label className="field__label" htmlFor="ContactForm-phone">Phone number</label>
      </div>
      <div className="field">
        <textarea id="ContactForm-body" name="message" className="field__input" placeholder=" " rows={6} required />
        <label className="field__label" htmlFor="ContactForm-body">Comment</label>
      </div>
      {error && <p className="form-error">Something went wrong. Please try again or email us directly.</p>}
      <button type="submit" className="button" disabled={busy}>
        {busy ? "Sending…" : "Send"}
      </button>
    </form>
  );
}
