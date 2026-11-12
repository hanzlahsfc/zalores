"use client";

import { useState } from "react";
import { subscribeNewsletter } from "@/lib/forms";
import { IconArrow, IconCheck } from "./Icons";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  if (done)
    return (
      <p className="newsletter-done">
        <IconCheck width={18} height={18} /> You&rsquo;re on the list — welcome
        to {`Zalores`}. Check your inbox for 10% off.
      </p>
    );

  return (
    <form
      className="newsletter-form"
      onSubmit={async (e) => {
        e.preventDefault();
        if (busy || !email.includes("@")) return;
        setBusy(true);
        const ok = await subscribeNewsletter(email);
        setBusy(false);
        if (ok) setDone(true);
      }}
    >
      <input
        type="email"
        required
        placeholder="Email address"
        aria-label="Email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button
        type="submit"
        className="btn btn-accent"
        aria-label="Subscribe"
        disabled={busy}
      >
        <IconArrow width={18} height={18} />
      </button>
    </form>
  );
}
