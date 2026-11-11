"use client";

import Link from "next/link";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/types";
import { useCart } from "./CartProvider";
import ProductImage from "./ProductImage";
import { IconPlus, Stars } from "./Icons";

export default function ProductCard({
  product,
  priority,
}: {
  product: Product;
  priority?: boolean;
}) {
  const { add } = useCart();

  return (
    <article className="product-card">
      <Link href={`/products/${product.slug}/`} className="product-card-media">
        {product.badge && (
          <span className={`badge badge-${product.badge.toLowerCase().replace(" ", "-")}`}>
            {product.badge}
          </span>
        )}
        <ProductImage product={product} uid={`pc-${product.slug}`} priority={priority} />
        <span className="quick-add-hint">Quick view</span>
      </Link>

      <div className="product-card-body">
        <div className="product-card-top">
          <Link href={`/products/${product.slug}/`} className="product-card-name">
            {product.name}
          </Link>
          <span className="product-card-price">
            {product.compareAt && (
              <s>{formatPrice(product.compareAt)}</s>
            )}
            {formatPrice(product.price)}
          </span>
        </div>
        <p className="product-card-meta">
          {product.colorways[0].name} · {product.colorways[0].lensName}
        </p>
        <div className="card-swatches" aria-hidden="true">
          {product.colorways.map((c) => (
            <i
              key={c.id}
              className="swatch"
              title={c.name}
              style={{ background: c.frameColor }}
            />
          ))}
        </div>
        <div className="product-card-foot">
          <span className="product-card-rating">
            <Stars rating={product.rating} size={13} />
            <em>({product.reviewCount})</em>
          </span>
          <button
            className="add-btn"
            aria-label={`Add ${product.name} to cart`}
            onClick={() => add(product.slug)}
          >
            <IconPlus width={16} height={16} /> Add
          </button>
        </div>
      </div>
    </article>
  );
}
