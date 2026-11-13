import type { Metadata } from "next";
import Link from "next/link";
import { getProductBySlug } from "@/lib/catalog";
import { products as staticProducts } from "@/lib/products";
import ProductImage from "@/components/ProductImage";

export const metadata: Metadata = {
  title: "About us",
  description:
    "Zalores sells hand-assembled metal sunglasses with real mineral-glass lenses, built the slow way and priced honestly.",
};

export default async function AboutPage() {
  const rep = (await getProductBySlug("aviator")) ?? staticProducts[0];
  return (
    <div className="page-width page-width--narrow main-page">
      <h1 className="main-page-title">About us</h1>
      <div className="rte">
        <p>
          Zalores started with a simple frustration: great-looking frames with
          poor lenses, or great optics in something you would never wear. We
          decided to stop choosing between the two.
        </p>
        <div className="page-image">
          <ProductImage product={rep} src="/assets/img/about.jpg" uid="about" />
        </div>
        <h2>Optics first</h2>
        <p>
          Every frame we sell is assembled by hand, soldered, plated and
          polished through more than 200 steps, then fitted with mineral-glass
          lenses. A frame is only as good as what you see through it.
        </p>
        <p>
          Alongside the frames we carry the accessories that keep a good pair
          going: leather cases, retainer straps and proper lens care.
        </p>
        <h2>Honest pricing</h2>
        <p>
          Premium eyewear often carries large markups through distributors and
          licensing. We keep it simple: well-made frames, fair prices, and a
          two-year warranty backed by people who answer their email.
        </p>
      </div>
      <p style={{ marginTop: 36 }}>
        <Link href="/shop/" className="button">
          Shop all
        </Link>
      </p>
    </div>
  );
}
