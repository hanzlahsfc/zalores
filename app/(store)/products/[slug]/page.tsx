import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { site } from "@/lib/site";
import { getProduct, products, relatedProducts } from "@/lib/products";
import { formatPrice } from "@/lib/format";
import ProductDetail from "@/components/ProductDetail";
import ProductBuy from "@/components/ProductBuy";
import ProductCard from "@/components/ProductCard";
import Accordion from "@/components/Accordion";
import ShareButton from "@/components/ShareButton";
import { IconLeaf, IconRefresh, IconShield, IconTruck, Stars } from "@/components/Icons";

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
  return { title: product.name, description: product.description };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  const related = relatedProducts(product, 4);

  return (
    <>
      <div className="page-width">
        <ProductDetail product={product}>
          <p className="caption-ls">{site.name}</p>
          <div className="product__title">
            <h1>{product.name}</h1>
          </div>

          <div className="product__rating">
            <Stars rating={product.rating} />
            <span>
              {product.rating.toFixed(1)} ({product.reviewCount})
            </span>
          </div>

          <div className="price price--large">
            {product.compareAt && <s>{formatPrice(product.compareAt)}</s>}
            <span>{formatPrice(product.price)}</span>
            {product.compareAt && <span className="badge badge--sale">Sale</span>}
            {product.stock === 0 && <span className="badge">Sold out</span>}
          </div>
          <p className="product__tax">
            <Link href="/policies/shipping-returns/">Shipping</Link> calculated at
            checkout.
          </p>

          {product.stock > 0 && product.stock <= 10 && (
            <p className="product__rating" style={{ gap: 8 }}>
              <span
                style={{ width: 9, height: 9, borderRadius: "50%", background: "#ee9441", display: "inline-block" }}
              />
              Low stock: {product.stock} left
            </p>
          )}

          <ProductBuy product={product} />

          <div className="product__description rte">
            <p>{product.description}</p>
          </div>

          <Accordion
            items={[
              {
                icon: <IconLeaf />,
                title: "Details",
                body: (
                  <ul>
                    {product.features.map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>
                ),
              },
              {
                icon: <IconTruck />,
                title: "Shipping",
                body: (
                  <p>
                    Orders placed before 2pm ET ship the same business day.
                    Standard shipping is free over{" "}
                    {formatPrice(site.freeShippingThreshold)}, otherwise $4.95.
                    Express delivery is available at checkout.
                  </p>
                ),
              },
              {
                icon: <IconRefresh />,
                title: "Returns",
                body: (
                  <p>
                    Return unworn frames within 30 days for a full refund. No
                    restocking fees. See our{" "}
                    <Link href="/policies/shipping-returns/">refund policy</Link>.
                  </p>
                ),
              },
              {
                icon: <IconShield />,
                title: "Warranty",
                body: (
                  <p>
                    Two years of coverage on hinges, coatings and finish. Every
                    pair ships with a hard case and microfiber cloth.
                  </p>
                ),
              },
            ]}
          />

          <ShareButton title={product.name} path={`/products/${product.slug}/`} />
        </ProductDetail>
      </div>

      <section className="section">
        <div className="page-width">
          <h2 className="h2" style={{ marginBottom: 30 }}>
            You may also like
          </h2>
          <ul className="product-grid product-grid--4" role="list">
            {related.map((p) => (
              <li key={p.slug}>
                <ProductCard product={p} />
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
