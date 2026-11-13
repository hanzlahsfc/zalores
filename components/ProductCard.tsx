"use client";

import Link from "next/link";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/types";
import { useCart } from "./CartProvider";
import ProductImage from "./ProductImage";
import { Stars } from "./Icons";

export default function ProductCard({
  product,
  priority,
}: {
  product: Product;
  priority?: boolean;
}) {
  const { add } = useCart();
  const href = `/products/${product.slug}/`;
  const hover = product.gallery[0];
  const soldOut = product.stock === 0;
  const badge = soldOut
    ? "Sold out"
    : product.compareAt
      ? "Sale"
      : product.badge;

  return (
    <div className="card-wrapper">
      <Link href={href} className="card__media" tabIndex={-1} aria-hidden="true">
        <ProductImage
          product={product}
          uid={`pc-${product.slug}`}
          priority={priority}
          className={hover ? "pimg--has-hover" : undefined}
        />
        {hover && (
          <ProductImage
            product={product}
            src={hover}
            uid={`pch-${product.slug}`}
            className="pimg--hover"
          />
        )}
        {badge && (
          <span className="card__badge">
            <span className={`badge${badge === "Sale" ? " badge--sale" : ""}`}>
              {badge}
            </span>
          </span>
        )}
      </Link>

      <div className="card__info">
        <h3 className="card__heading">
          <Link href={href}>{product.name}</Link>
        </h3>
        <div className="card__rating">
          <Stars rating={product.rating} />
          <span>({product.reviewCount})</span>
        </div>
        <div className="price">
          {product.compareAt && <s>{formatPrice(product.compareAt)}</s>}
          <span>{formatPrice(product.price)}</span>
        </div>
        <div className="quick-add">
          {product.colorways.length > 1 ? (
            <Link href={href} className="button button--secondary">
              Choose options
            </Link>
          ) : (
            <button
              type="button"
              className="button button--secondary"
              disabled={soldOut}
              onClick={() => add(product.slug)}
            >
              {soldOut ? "Sold out" : "Add to cart"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
