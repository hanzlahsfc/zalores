"use client";

import { useState } from "react";
import { IconCheck } from "./Icons";

export default function ContactForm() {
  const [sent, setSent] = useState(false);

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
      onSubmit={(e) => {
        e.preventDefault();
        // Wire to your email/form backend (Formspree, Resend, etc.) here.
        setSent(true);
      }}
    >
      <div className="field-row">
        <label className="field">
          <span>Name</span>
          <input required autoComplete="name" />
        </label>
        <label className="field">
          <span>Email</span>
          <input type="email" required autoComplete="email" />
        </label>
      </div>
      <label className="field">
        <span>Subject</span>
        <select required defaultValue="">
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
        <textarea required rows={5} />
      </label>
      <button type="submit" className="btn btn-dark btn-lg">
        Send message
      </button>
    </form>
  );
}
