"use client";

import { useState } from "react";
import { IconArrow, IconCheck } from "./Icons";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

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
      onSubmit={(e) => {
        e.preventDefault();
        if (email.includes("@")) setDone(true);
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
      <button type="submit" className="btn btn-accent" aria-label="Subscribe">
        <IconArrow width={18} height={18} />
      </button>
    </form>
  );
}
