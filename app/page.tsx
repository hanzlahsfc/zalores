import Link from "next/link";
import { site } from "@/lib/site";
import { collections, getProduct, products } from "@/lib/products";
import { formatPrice } from "@/lib/format";
import ProductCard from "@/components/ProductCard";
import ProductArt from "@/components/ProductArt";
import ProductImage from "@/components/ProductImage";
import {
  IconArrow,
  IconCheck,
  IconLeaf,
  IconRefresh,
  IconShield,
  IconSun,
  IconTruck,
  Stars,
} from "@/components/Icons";

const hero = getProduct("aviator")!;
const heroAlt = getProduct("concorde")!;

const perks = [
  { icon: IconTruck, title: `Free shipping over ${formatPrice(site.freeShippingThreshold)}`, sub: "Ships same day before 2pm ET" },
  { icon: IconSun, title: "Polarized UV400", sub: "100% UVA/UVB protection" },
  { icon: IconRefresh, title: "30-day returns", sub: "No questions, no fees" },
  { icon: IconShield, title: "2-year warranty", sub: "On every frame, always" },
];

const reviews = [
  {
    quote:
      "The mineral glass is on another level — sharper and clearer than anything I've owned, including pairs twice the price.",
    name: "Maya R.",
    detail: "Aviator — verified buyer",
    rating: 5,
  },
  {
    quote:
      "Cobalt lenses killed the glare off the water completely. First pair I've owned that actually survives a year of fishing.",
    name: "Daniel K.",
    detail: "Aviator Cobalt — verified buyer",
    rating: 5,
  },
  {
    quote:
      "Bayonet temples under a headset for six hours, zero pressure points. Now I get why pilots swear by these.",
    name: "Priya S.",
    detail: "Concorde — verified buyer",
    rating: 5,
  },
];

const craft = [
  {
    icon: IconLeaf,
    title: "Hand-assembled, one at a time",
    body: "Every frame passes through 200+ hands-on steps — soldered, polished and inspected before a lens is ever fitted.",
  },
  {
    icon: IconSun,
    title: "Mineral-glass optics",
    body: "Real glass lenses, ground for zero distortion and hardened against scratches — not a tinted plastic stamp-out.",
  },
  {
    icon: IconShield,
    title: "Bayonet temples",
    body: "The military-spec temple that slides under headsets and helmets without pressure points. Built to be repaired, not replaced.",
  },
];

export default function HomePage() {
  return (
    <>
      {/* ---------- Hero ---------- */}
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-copy">
            <span className="eyebrow">{site.heroKicker}</span>
            <h1>{site.heroTitle}</h1>
            <p className="hero-sub">{site.heroSub}</p>
            <div className="hero-ctas">
              <Link href="/shop/" className="btn btn-dark btn-lg">
                Shop the collection
              </Link>
              <Link href="/about/" className="btn btn-ghost btn-lg">
                Our story
              </Link>
            </div>
            <div className="hero-proof">
              <Stars rating={5} size={15} />
              <span>
                <strong>4.9</strong> from 2,800+ verified reviews
              </span>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-arch">
              <ProductImage
                product={hero}
                src="/assets/img/hero.jpg"
                uid="hero-main"
                priority
              />
            </div>
            <div className="hero-chip hero-chip-a">
              <IconSun width={16} height={16} /> Polarized · UV400
            </div>
            <Link
              href={`/products/${heroAlt.slug}/`}
              className="hero-mini-card hero-chip-b"
            >
              <span className="hero-mini-thumb">
                <ProductArt product={heroAlt} uid="hero-alt" />
              </span>
              <span>
                <strong>{heroAlt.name}</strong>
                <em>{formatPrice(heroAlt.price)}</em>
              </span>
              <IconArrow width={16} height={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ---------- Marquee ---------- */}
      <div className="marquee" aria-hidden="true">
        <div className="marquee-track">
          {Array.from({ length: 2 }).map((_, i) => (
            <span key={i}>
              Mineral-glass lenses &nbsp;✦&nbsp; Hand-assembled frames
              &nbsp;✦&nbsp; Free shipping over $75 &nbsp;✦&nbsp; 30-day returns
              &nbsp;✦&nbsp; 2-year warranty &nbsp;✦&nbsp;
            </span>
          ))}
        </div>
      </div>

      {/* ---------- Perks ---------- */}
      <section className="perks">
        <div className="perks-inner">
          {perks.map((p) => (
            <div key={p.title} className="perk">
              <p.icon width={26} height={26} />
              <div>
                <strong>{p.title}</strong>
                <span>{p.sub}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Bestsellers ---------- */}
      <section className="section">
        <div className="section-head">
          <div>
            <span className="eyebrow">Most loved</span>
            <h2>The bestsellers</h2>
          </div>
          <Link href="/shop/" className="link-arrow">
            Shop all <IconArrow width={16} height={16} />
          </Link>
        </div>
        <div className="product-grid grid-3">
          {[getProduct("aviator")!, getProduct("concorde")!, getProduct("shelby-aviator-ii")!].map(
            (p, i) => (
              <ProductCard key={p.slug} product={p} priority={i === 0} />
            )
          )}
        </div>
      </section>

      {/* ---------- Editorial ---------- */}
      <section className="editorial">
        <div className="editorial-inner">
          <div className="editorial-media">
            <ProductImage
              product={getProduct("aviator")!}
              src="/assets/img/editorial.jpg"
              uid="ed-aviator"
            />
          </div>
          <div className="editorial-copy">
            <span className="eyebrow">Our craft</span>
            <h2>Made the hard way, on purpose.</h2>
            <p>
              Most sunglasses are stamped out in a day. Ours are soldered,
              plated and polished by hand — then fitted with real mineral-glass
              lenses, because optics are the whole point.
            </p>
            <ul className="check-list">
              <li>
                <IconCheck width={16} height={16} /> Hand-assembled metal frames
                — 200+ steps per pair
              </li>
              <li>
                <IconCheck width={16} height={16} /> Mineral-glass lenses —
                sharper and harder than polycarbonate
              </li>
              <li>
                <IconCheck width={16} height={16} /> Bayonet temples — the
                military-spec fit pilots trust
              </li>
            </ul>
            <Link href="/about/" className="btn btn-dark">
              Read our story
            </Link>
          </div>
        </div>
      </section>

      {/* ---------- Collections ---------- */}
      <section className="section">
        <div className="section-head">
          <div>
            <span className="eyebrow">Find your lane</span>
            <h2>Shop by collection</h2>
          </div>
        </div>
        <div className="collection-grid">
          {collections.map((c, i) => {
            const rep = products.find((p) => p.collection === c.slug)!;
            return (
              <Link
                key={c.slug}
                href={`/shop/?collection=${c.slug}`}
                className="collection-card"
                style={{ background: rep.tint }}
              >
                <div className="collection-art">
                  <ProductImage
                    product={rep}
                    src={c.image}
                    uid={`col-${c.slug}`}
                  />
                </div>
                <div className="collection-info">
                  <h3>{c.name}</h3>
                  <p>{c.description}</p>
                  <span className="link-arrow">
                    Shop {c.name.toLowerCase()} <IconArrow width={15} height={15} />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ---------- Craft ---------- */}
      <section className="craft">
        <div className="craft-inner">
          {craft.map((f) => (
            <div key={f.title} className="craft-card">
              <f.icon width={28} height={28} />
              <h3>{f.title}</h3>
              <p>{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Reviews ---------- */}
      <section className="section">
        <div className="section-head">
          <div>
            <span className="eyebrow">2,800+ reviews</span>
            <h2>Worn everywhere.</h2>
          </div>
        </div>
        <div className="review-grid">
          {reviews.map((r) => (
            <figure key={r.name} className="review-card">
              <Stars rating={r.rating} size={15} />
              <blockquote>&ldquo;{r.quote}&rdquo;</blockquote>
              <figcaption>
                <strong>{r.name}</strong>
                <span>{r.detail}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* ---------- Closing CTA ---------- */}
      <section className="cta-band">
        <div>
          <span className="eyebrow eyebrow-light">Ready when you are</span>
          <h2>Golden hour is calling.</h2>
        </div>
        <Link href="/shop/" className="btn btn-light btn-lg">
          Shop the collection <IconArrow width={17} height={17} />
        </Link>
      </section>
    </>
  );
}
