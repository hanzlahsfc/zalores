"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { collections, products } from "@/lib/products";
import type { CollectionSlug } from "@/lib/types";
import ProductCard from "./ProductCard";

type Sort = "featured" | "price-asc" | "price-desc" | "rating";

export default function ShopClient() {
  const params = useSearchParams();
  const initial = (params.get("collection") ?? "all") as CollectionSlug | "all";
  const [collection, setCollection] = useState<CollectionSlug | "all">(initial);
  const [sort, setSort] = useState<Sort>("featured");

  const filtered = useMemo(() => {
    let list =
      collection === "all"
        ? [...products]
        : products.filter((p) => p.collection === collection);
    switch (sort) {
      case "price-asc":
        list.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        list.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        list.sort((a, b) => b.rating - a.rating);
        break;
    }
    return list;
  }, [collection, sort]);

  return (
    <>
      <div className="shop-controls">
        <div className="chip-row" role="tablist" aria-label="Collections">
          <button
            className={`chip${collection === "all" ? " active" : ""}`}
            onClick={() => setCollection("all")}
          >
            All
          </button>
          {collections.map((c) => (
            <button
              key={c.slug}
              className={`chip${collection === c.slug ? " active" : ""}`}
              onClick={() => setCollection(c.slug)}
            >
              {c.name}
            </button>
          ))}
        </div>
        <div className="shop-controls-right">
          <span className="shop-count">
            {filtered.length} {filtered.length === 1 ? "style" : "styles"}
          </span>
          <select
            className="sort-select"
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            aria-label="Sort products"
          >
            <option value="featured">Featured</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
            <option value="rating">Top rated</option>
          </select>
        </div>
      </div>

      <div className="product-grid grid-3">
        {filtered.map((p) => (
          <ProductCard key={p.slug} product={p} />
        ))}
      </div>
    </>
  );
}
