"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { collections, products } from "@/lib/products";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/types";
import ProductCard from "./ProductCard";
import { IconCaret, IconClose, IconFilter } from "./Icons";

type Sort = "manual" | "best-selling" | "title-asc" | "title-desc" | "price-asc" | "price-desc";

const SORTS: { value: Sort; label: string }[] = [
  { value: "manual", label: "Featured" },
  { value: "best-selling", label: "Best selling" },
  { value: "title-asc", label: "Alphabetically, A-Z" },
  { value: "title-desc", label: "Alphabetically, Z-A" },
  { value: "price-asc", label: "Price, low to high" },
  { value: "price-desc", label: "Price, high to low" },
];

const typeOf = (p: Product) => (p.collection === "accessories" ? "Accessories" : "Sunglasses");
const TYPES = ["Sunglasses", "Accessories"];
const MAX_PRICE = Math.max(...products.map((p) => p.price));

interface Filters {
  inStock: boolean;
  outOfStock: boolean;
  types: string[];
  min: string;
  max: string;
}
const EMPTY: Filters = { inStock: false, outOfStock: false, types: [], min: "", max: "" };

function apply(list: Product[], f: Filters) {
  return list.filter((p) => {
    if (f.inStock !== f.outOfStock) {
      if (f.inStock && p.stock === 0) return false;
      if (f.outOfStock && p.stock > 0) return false;
    }
    if (f.types.length && !f.types.includes(typeOf(p))) return false;
    if (f.min && p.price < Number(f.min)) return false;
    if (f.max && p.price > Number(f.max)) return false;
    return true;
  });
}

export default function ShopClient() {
  const params = useSearchParams();
  const slug = params.get("collection");
  const collection = collections.find((c) => c.slug === slug);
  const base = collection ? products.filter((p) => p.collection === collection.slug) : products;

  const [filters, setFilters] = useState<Filters>(EMPTY);
  const [sort, setSort] = useState<Sort>("manual");
  const [openFacet, setOpenFacet] = useState<string | null>(null);
  const [drawer, setDrawer] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => setFilters(EMPTY), [slug]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (barRef.current && !barRef.current.contains(e.target as Node)) setOpenFacet(null);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const list = useMemo(() => {
    const out = apply(base, filters);
    const by: Record<Sort, (a: Product, b: Product) => number> = {
      manual: () => 0,
      "best-selling": (a, b) => b.reviewCount - a.reviewCount,
      "title-asc": (a, b) => a.name.localeCompare(b.name),
      "title-desc": (a, b) => b.name.localeCompare(a.name),
      "price-asc": (a, b) => a.price - b.price,
      "price-desc": (a, b) => b.price - a.price,
    };
    return [...out].sort(by[sort]);
  }, [base, filters, sort]);

  const set = (patch: Partial<Filters>) => setFilters((f) => ({ ...f, ...patch }));
  const toggleType = (t: string) =>
    set({ types: filters.types.includes(t) ? filters.types.filter((x) => x !== t) : [...filters.types, t] });
  const inStockCount = base.filter((p) => p.stock > 0).length;
  const count = `${list.length} ${list.length === 1 ? "product" : "products"}`;

  const pills: { label: string; clear: () => void }[] = [
    ...(filters.inStock ? [{ label: "In stock", clear: () => set({ inStock: false }) }] : []),
    ...(filters.outOfStock ? [{ label: "Out of stock", clear: () => set({ outOfStock: false }) }] : []),
    ...filters.types.map((t) => ({ label: t, clear: () => toggleType(t) })),
    ...(filters.min || filters.max
      ? [
          {
            label: `${formatPrice(Number(filters.min || 0))} - ${formatPrice(Number(filters.max || MAX_PRICE))}`,
            clear: () => set({ min: "", max: "" }),
          },
        ]
      : []),
  ];

  const availability = (
    <ul className="facets__list" role="list">
      <li>
        <label className="facet-checkbox">
          <input type="checkbox" checked={filters.inStock} onChange={(e) => set({ inStock: e.target.checked })} />
          In stock ({inStockCount})
        </label>
      </li>
      <li>
        <label className={`facet-checkbox${base.length - inStockCount === 0 ? " disabled" : ""}`}>
          <input
            type="checkbox"
            disabled={base.length - inStockCount === 0}
            checked={filters.outOfStock}
            onChange={(e) => set({ outOfStock: e.target.checked })}
          />
          Out of stock ({base.length - inStockCount})
        </label>
      </li>
    </ul>
  );

  const types = (
    <ul className="facets__list" role="list">
      {TYPES.map((t) => {
        const n = base.filter((p) => typeOf(p) === t).length;
        return (
          <li key={t}>
            <label className={`facet-checkbox${n === 0 ? " disabled" : ""}`}>
              <input type="checkbox" disabled={n === 0} checked={filters.types.includes(t)} onChange={() => toggleType(t)} />
              {t} ({n})
            </label>
          </li>
        );
      })}
    </ul>
  );

  const price = (idPrefix: string) => (
    <div className="facets__price">
      <div className="field">
        <input
          id={`${idPrefix}-min`}
          className="field__input"
          type="number"
          min={0}
          placeholder="0"
          value={filters.min}
          onChange={(e) => set({ min: e.target.value })}
        />
        <label className="field__label" htmlFor={`${idPrefix}-min`}>From</label>
      </div>
      <div className="field">
        <input
          id={`${idPrefix}-max`}
          className="field__input"
          type="number"
          min={0}
          placeholder={String(MAX_PRICE)}
          value={filters.max}
          onChange={(e) => set({ max: e.target.value })}
        />
        <label className="field__label" htmlFor={`${idPrefix}-max`}>To</label>
      </div>
    </div>
  );

  const facet = (key: string, label: string, selected: number, reset: () => void, body: React.ReactNode, header?: string) => (
    <div className={`facets__disclosure${openFacet === key ? " open" : ""}`}>
      <button
        type="button"
        className="facets__summary"
        aria-expanded={openFacet === key}
        onClick={() => setOpenFacet(openFacet === key ? null : key)}
      >
        <span>{label}</span>
        <IconCaret />
      </button>
      {openFacet === key && (
        <div className="facets__display">
          <div className="facets__header">
            <span>{header ?? `${selected} selected`}</span>
            <button type="button" className="link" onClick={reset}>Reset</button>
          </div>
          {body}
        </div>
      )}
    </div>
  );

  const sortSelect = (id: string) => (
    <div className="sort-wrap">
      <label htmlFor={id} className="facets__heading">Sort by:</label>
      <select id={id} className="facet-filters__sort" value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
        {SORTS.map((s) => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </select>
      <IconCaret />
    </div>
  );

  return (
    <>
      <div className="collection-hero">
        <h1>
          <span className="visually-hidden">Collection: </span>
          {collection?.name ?? "Products"}
        </h1>
        {collection && <p className="collection-hero__description">{collection.description}</p>}
        <nav className="collection-nav" aria-label="Collections">
          <Link href="/shop/" aria-current={!collection ? "page" : undefined}>All</Link>
          {collections.map((c) => (
            <Link key={c.slug} href={`/shop/?collection=${c.slug}`} aria-current={collection?.slug === c.slug ? "page" : undefined}>
              {c.name}
            </Link>
          ))}
        </nav>
      </div>

      <div className="facets facets--desktop" ref={barRef}>
        <div className="facets__left">
          <span className="facets__heading">Filter:</span>
          {facet("availability", "Availability", Number(filters.inStock) + Number(filters.outOfStock), () => set({ inStock: false, outOfStock: false }), availability)}
          {facet("price", "Price", 0, () => set({ min: "", max: "" }), price("d"), `The highest price is ${formatPrice(MAX_PRICE)}`)}
          {facet("type", "Product type", filters.types.length, () => set({ types: [] }), types)}
        </div>
        <div className="facets__right">
          {sortSelect("SortBy")}
          <span className="product-count">{count}</span>
        </div>
      </div>

      <div className="facets facets--mobile">
        <button type="button" className="mobile-facets__open" onClick={() => setDrawer(true)}>
          <IconFilter /> Filter and sort
        </button>
        <span className="product-count" style={{ fontSize: 14 }}>{count}</span>
      </div>

      {pills.length > 0 && (
        <div className="active-facets">
          {pills.map((p) => (
            <button key={p.label} type="button" className="active-facets__pill" onClick={p.clear}>
              {p.label} <IconClose />
            </button>
          ))}
          <button type="button" className="active-facets__clear" onClick={() => setFilters(EMPTY)}>
            Remove all
          </button>
        </div>
      )}

      {list.length > 0 ? (
        <ul className="product-grid product-grid--4" role="list">
          {list.map((p, i) => (
            <li key={p.slug}>
              <ProductCard product={p} priority={i < 4} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="empty-state">
          <h2>No products found</h2>
          <p>Use fewer filters or remove all</p>
          <button type="button" className="button" onClick={() => setFilters(EMPTY)}>
            Remove all
          </button>
        </div>
      )}

      {drawer && <div className="overlay" onClick={() => setDrawer(false)} />}
      <div className={`mobile-facets${drawer ? " open" : ""}`} role="dialog" aria-modal="true" aria-label="Filter and sort">
        <div className="mobile-facets__header">
          <h2>Filter and sort</h2>
          <p>{count}</p>
          <button type="button" className="icon-btn" aria-label="Close" onClick={() => setDrawer(false)}>
            <IconClose />
          </button>
        </div>
        <div className="mobile-facets__main">
          <div className="mobile-facets__group">
            <h3>Availability</h3>
            {availability}
          </div>
          <div className="mobile-facets__group">
            <h3>Price</h3>
            <p style={{ fontSize: 13 }}>The highest price is {formatPrice(MAX_PRICE)}</p>
            {price("m")}
          </div>
          <div className="mobile-facets__group">
            <h3>Product type</h3>
            {types}
          </div>
          <div className="mobile-facets__group">{sortSelect("SortBy-mobile")}</div>
        </div>
        <div className="mobile-facets__footer">
          <button type="button" className="button button--secondary" onClick={() => setFilters(EMPTY)}>
            Remove all
          </button>
          <button type="button" className="button" onClick={() => setDrawer(false)}>
            Apply
          </button>
        </div>
      </div>
    </>
  );
}
