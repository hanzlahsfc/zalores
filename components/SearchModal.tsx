"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { products } from "@/lib/products";
import { formatPrice } from "@/lib/format";
import ProductImage from "./ProductImage";
import { IconArrow, IconClose } from "./Icons";

const POPULAR = ["Aviator", "Tortoise", "Polarized", "Sport", "Cat-eye"];

export default function SearchModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQ("");
      setTimeout(() => inputRef.current?.focus(), 60);
    }
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return [];
    return products.filter((p) =>
      [
        p.name,
        p.tagline,
        p.collection,
        p.silhouette,
        ...p.colorways.flatMap((c) => [c.name, c.lensName]),
      ]
        .join(" ")
        .toLowerCase()
        .includes(needle)
    );
  }, [q]);

  if (!open) return null;

  return (
    <>
      <div className="scrim" onClick={onClose} />
      <div className="search-modal" role="dialog" aria-modal="true" aria-label="Search">
        <div className="search-bar">
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search sunglasses, colors, collections…"
            aria-label="Search products"
          />
          <button className="icon-btn" aria-label="Close search" onClick={onClose}>
            <IconClose width={20} height={20} />
          </button>
        </div>

        {q.trim() === "" ? (
          <div className="search-suggest">
            <span>Popular:</span>
            {POPULAR.map((t) => (
              <button key={t} className="chip" onClick={() => setQ(t)}>
                {t}
              </button>
            ))}
          </div>
        ) : results.length === 0 ? (
          <p className="search-none">
            No results for &ldquo;{q}&rdquo; — try a style, color or
            collection.
          </p>
        ) : (
          <ul className="search-results">
            {results.map((p) => (
              <li key={p.slug}>
                <Link href={`/products/${p.slug}/`} onClick={onClose}>
                  <span className="sr-thumb">
                    <ProductImage product={p} uid={`sr-${p.slug}`} />
                  </span>
                  <span className="sr-info">
                    <strong>{p.name}</strong>
                    <em>{p.tagline}</em>
                  </span>
                  <span className="sr-price">{formatPrice(p.price)}</span>
                  <IconArrow width={15} height={15} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
