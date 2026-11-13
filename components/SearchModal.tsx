"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { products } from "@/lib/products";
import { formatPrice } from "@/lib/format";
import ProductImage from "./ProductImage";
import { IconArrow, IconClose, IconSearch } from "./Icons";

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
    if (!open) return;
    setQ("");
    const t = setTimeout(() => inputRef.current?.focus(), 30);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return [];
    return products
      .filter((p) =>
        [p.name, p.tagline, p.collection, ...p.colorways.flatMap((c) => [c.name, c.lensName])]
          .join(" ")
          .toLowerCase()
          .includes(needle)
      )
      .slice(0, 6);
  }, [q]);

  if (!open) return null;

  return (
    <>
      <div className="overlay" onClick={onClose} />
      <div className="search-modal" role="dialog" aria-modal="true" aria-label="Search">
        <div className="page-width search-modal__content">
          <form
            className="search-modal__form"
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              if (results[0]) window.location.href = `/products/${results[0].slug}/`;
            }}
          >
            <div className="field">
              <input
                ref={inputRef}
                id="Search-In-Modal"
                className="field__input"
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder=" "
                autoComplete="off"
              />
              <label className="field__label" htmlFor="Search-In-Modal">
                Search
              </label>
              <button type="submit" className="field__button" aria-label="Search">
                <IconSearch />
              </button>
            </div>
          </form>
          <button className="icon-btn" aria-label="Close search" onClick={onClose}>
            <IconClose />
          </button>
        </div>

        {q.trim() !== "" && (
          <div className="page-width">
            <div className="predictive-search">
              {results.length > 0 ? (
                <>
                  <h2 className="predictive-search__heading">Products</h2>
                  <ul role="list">
                    {results.map((p) => (
                      <li key={p.slug}>
                        <Link
                          href={`/products/${p.slug}/`}
                          className="predictive-search__item"
                          onClick={onClose}
                        >
                          <span className="predictive-search__thumb">
                            <ProductImage product={p} uid={`ps-${p.slug}`} />
                          </span>
                          <span>
                            <span className="predictive-search__title">{p.name}</span>
                            <span className="predictive-search__price">{formatPrice(p.price)}</span>
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <p className="predictive-search__empty">No results found for &ldquo;{q}&rdquo;</p>
              )}
              <Link href="/shop/" className="predictive-search__term" onClick={onClose}>
                <span>Search for &ldquo;{q}&rdquo;</span>
                <IconArrow />
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
