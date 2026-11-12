import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProduct, products, relatedProducts } from "@/lib/products";
import { formatPrice } from "@/lib/format";
import ProductDetail from "@/components/ProductDetail";
import ProductBuy from "@/components/ProductBuy";
import ProductCard from "@/components/ProductCard";
import Accordion from "@/components/Accordion";
import { IconCheck, IconRefresh, IconShield, IconTruck, Stars } from "@/components/Icons";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return {};
  return {
    title: `${product.name} | ${product.tagline}`,
    description: product.description,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  const related = relatedProducts(product);

  return (
    <div className="page-wrap">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span>/</span>
        <Link href="/shop/">Shop</Link>
        <span>/</span>
        <span>{product.name}</span>
      </nav>

      <ProductDetail product={product}>
        <h1>{product.name}</h1>
        <p className="pdp-tagline">{product.tagline}</p>

        <div className="pdp-rating">
          <Stars rating={product.rating} />
          <span>
            {product.rating} · {product.reviewCount} reviews
          </span>
        </div>

        <div className="pdp-price">
          {product.compareAt && <s>{formatPrice(product.compareAt)}</s>}
          <strong>{formatPrice(product.price)}</strong>
          {product.compareAt && (
            <span className="save-tag">
              Save {formatPrice(product.compareAt - product.price)}
            </span>
          )}
        </div>

        <p className="pdp-desc">{product.description}</p>

        {product.stock <= 10 && (
          <p className="stock-note">
            Selling fast: only {product.stock} left in stock
          </p>
        )}

        <ProductBuy product={product} />

        <ul className="pdp-assurances">
          <li>
            <IconTruck width={17} height={17} /> Free shipping over $75
          </li>
          <li>
            <IconRefresh width={17} height={17} /> 30-day returns
          </li>
          <li>
            <IconShield width={17} height={17} /> 2-year warranty
          </li>
        </ul>

        <Accordion
          items={[
            {
              title: "Details & features",
              body: (
                <ul className="feature-list">
                  {product.features.map((f) => (
                    <li key={f}>
                      <IconCheck width={15} height={15} /> {f}
                    </li>
                  ))}
                </ul>
              ),
            },
            {
              title: "Shipping & returns",
              body: (
                <p>
                  Orders ship same business day before 2pm ET. Standard
                  shipping is free over $75 (otherwise $4.95). You have 30
                  days to return unworn frames for a full refund.
                </p>
              ),
            },
            {
              title: "In the box",
              body: (
                <p>
                  {product.name} sunglasses, hard-shell protective case,
                  microfiber cleaning cloth, and a lifetime lens-replacement
                  card.
                </p>
              ),
            },
          ]}
        />
      </ProductDetail>

      <section className="section related">
        <div className="section-head">
          <h2>You may also like</h2>
        </div>
        <div className="product-grid grid-3">
          {related.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
