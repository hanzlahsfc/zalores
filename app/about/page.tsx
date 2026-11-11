import type { Metadata } from "next";
import Link from "next/link";
import { getProduct } from "@/lib/products";
import ProductImage from "@/components/ProductImage";

export const metadata: Metadata = {
  title: "About",
  description:
    "Zalores makes polarized sunglasses the slow way — hand-finished acetate, real optics, honest prices.",
};

const stats = [
  { n: "72", label: "hours every frame is tumbled" },
  { n: "4.9", label: "average review, 2,800+ buyers" },
  { n: "30k", label: "folds our hinges are rated for" },
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
            product={getProduct("coastline")!}
            src="/assets/img/about.jpg"
            uid="about-hero"
          />
        </div>
        <div className="about-copy">
          <h2>Optics first, always.</h2>
          <p>
            Every pair ships with nylon polarized lenses — the same material
            used in premium sport optics — because a frame is only as good as
            what you see through it. UV400 protection, anti-scratch,
            anti-glare and hydrophobic coatings are standard, not upgrades.
          </p>
          <p>
            Our acetate comes from plant-based stock, gets tumbled for three
            days and polished by hand. It costs more and takes longer. It also
            means your frames feel like they belong on your face, not in a
            gas-station spinner rack.
          </p>
          <h2>Priced for people, not margins.</h2>
          <p>
            Premium sunglasses carry 10x markups through distributors and
            licensing houses. We sell direct, so the $85 pair wears like a
            $250 pair — because that&rsquo;s roughly what went into it.
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
          <h2>See what slow made.</h2>
        </div>
        <Link href="/shop/" className="btn btn-light btn-lg">
          Shop sunglasses
        </Link>
      </section>
    </div>
  );
}
