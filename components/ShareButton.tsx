"use client";

import { useState } from "react";
import { IconShare } from "./Icons";

export default function ShareButton({ title, path }: { title: string; path: string }) {
  const [copied, setCopied] = useState(false);

  const share = async () => {
    const url = `${window.location.origin}${path}`;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        /* dismissed */
      }
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button type="button" className="share-button" onClick={share}>
      <IconShare />
      <span>{copied ? "Link copied to clipboard" : "Share"}</span>
    </button>
  );
}
