import type { Metadata } from "next";
import Link from "next/link";
import { getProduct } from "@/lib/products";
import ProductImage from "@/components/ProductImage";

export const metadata: Metadata = {
  title: "About",
  description:
    "Zalores sells hand-assembled metal sunglasses with real mineral-glass lenses, frames built the slow way, priced honestly.",
};

const stats = [
  { n: "200+", label: "hands-on steps in every frame" },
  { n: "4.9", label: "average review, 2,800+ buyers" },
  { n: "1978", label: "the year the first frame shipped" },
];

export default function AboutPage() {
  return (
    <div className="page-wrap">
      <header className="page-head">
        <span className="eyebrow">Our story</span>
        <h1>Sunglasses made the slow way.</h1>
        <p className="page-sub">
          Zalores started with a simple frustration: great-looking frames with
          terrible lenses, or great optics wrapped in something you&rsquo;d
          never wear. We decided to stop choosing.
        </p>
      </header>

      <div className="about-split">
        <div className="about-media">
          <ProductImage
            product={getProduct("aviator")!}
            src="/assets/img/about.jpg"
            uid="about-hero"
          />
        </div>
        <div className="about-copy">
          <h2>Optics first, always.</h2>
          <p>
            Every frame we sell is hand-assembled, soldered, plated and
            polished through 200+ individual steps, then fitted with real
            mineral-glass lenses, because a frame is only as good as what you
            see through it. These are the same frames issued to military
            pilots for decades.
          </p>
          <p>
            We stock the full line plus the accessories that keep a good pair
            alive: leather cases, retainer straps and proper lens-care kits.
          </p>
          <h2>Priced for people, not margins.</h2>
          <p>
            Premium eyewear carries 10x markups through distributors and
            licensing houses. We keep it simple: authorized frames, honest
            prices, and a warranty we actually answer email about.
          </p>
        </div>
      </div>

      <div className="stats-row">
        {stats.map((s) => (
          <div key={s.label} className="stat">
            <strong>{s.n}</strong>
            <span>{s.label}</span>
          </div>
        ))}
      </div>

      <section className="cta-band">
        <div>
          <span className="eyebrow eyebrow-light">The collection</span>
          <h2>See what 200 steps makes.</h2>
        </div>
        <Link href="/shop/" className="btn btn-light btn-lg">
          Shop sunglasses
        </Link>
      </section>
    </div>
  );
}
