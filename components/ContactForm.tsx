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
      <div className="form-done">
        <IconCheck width={26} height={26} />
        <h2>Message sent</h2>
        <p>We&rsquo;ll get back to you within one business day.</p>
      </div>
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
        const ok = await submitContact({
          name: String(f.get("name")),
          email: String(f.get("email")),
          subject: String(f.get("subject")),
          message: String(f.get("message")),
        });
        setBusy(false);
        if (ok) setSent(true);
        else setError(true);
      }}
    >
      {/* honeypot, bots fill it, humans never see it */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="hp-field"
        aria-hidden="true"
      />
      <div className="field-row">
        <label className="field">
          <span>Name</span>
          <input name="name" required autoComplete="name" />
        </label>
        <label className="field">
          <span>Email</span>
          <input name="email" type="email" required autoComplete="email" />
        </label>
      </div>
      <label className="field">
        <span>Subject</span>
        <select name="subject" required defaultValue="">
          <option value="" disabled>
            Choose a topic
          </option>
          <option>Order question</option>
          <option>Returns &amp; exchanges</option>
          <option>Product &amp; fit</option>
          <option>Wholesale</option>
          <option>Something else</option>
        </select>
      </label>
      <label className="field">
        <span>Message</span>
        <textarea name="message" required rows={5} />
      </label>
      {error && (
        <p className="form-error">
          Something went wrong. Please try again or email us directly.
        </p>
      )}
      <button type="submit" className="btn btn-dark btn-lg" disabled={busy}>
        {busy ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
