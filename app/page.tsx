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

const hero = getProduct("meridian")!;
const heroAlt = getProduct("solana")!;

const perks = [
  { icon: IconTruck, title: `Free shipping over ${formatPrice(site.freeShippingThreshold)}`, sub: "Ships same day before 2pm ET" },
  { icon: IconSun, title: "Polarized UV400", sub: "100% UVA/UVB protection" },
  { icon: IconRefresh, title: "30-day returns", sub: "No questions, no fees" },
  { icon: IconShield, title: "2-year warranty", sub: "On every frame, always" },
];

const reviews = [
  {
    quote:
      "I've owned Ray-Bans for a decade and these are better. The acetate feels twice the price.",
    name: "Maya R.",
    detail: "Meridian — verified buyer",
    rating: 5,
  },
  {
    quote:
      "Cut the glare off the water completely. First pair of sunglasses I haven't lost or broken in a year.",
    name: "Daniel K.",
    detail: "Coastline — verified buyer",
    rating: 5,
  },
  {
    quote:
      "The Solana gets compliments everywhere. Packaging alone felt like a gift to myself.",
    name: "Priya S.",
    detail: "Solana — verified buyer",
    rating: 5,
  },
];

const craft = [
  {
    icon: IconLeaf,
    title: "Hand-finished acetate",
    body: "Mazzucchelli-derived plant acetate, tumbled for 72 hours and polished by hand. No injection-molded plastic.",
  },
  {
    icon: IconSun,
    title: "Optics first",
    body: "Nylon polarized lenses with anti-scratch, anti-glare and hydrophobic coatings — not tinted glass.",
  },
  {
    icon: IconShield,
    title: "Built to keep",
    body: "Five-barrel steel hinges, a 2-year warranty, and discounted lifetime lens replacements.",
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
              Polarized UV400 &nbsp;✦&nbsp; Hand-finished acetate
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
          {[getProduct("meridian")!, getProduct("solana")!, getProduct("coastline")!].map(
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
              product={getProduct("verano")!}
              src="/assets/img/editorial.jpg"
              uid="ed-verano"
            />
          </div>
          <div className="editorial-copy">
            <span className="eyebrow">Our craft</span>
            <h2>Built for long light.</h2>
            <p>
              Most sunglasses are designed in a week and molded in a day. Ours
              start as raw acetate blocks, get cut, tumbled for three days, and
              polished by hand before a polarized lens is ever fitted.
            </p>
            <ul className="check-list">
              <li>
                <IconCheck width={16} height={16} /> Plant-based Italian acetate,
                never brittle plastic
              </li>
              <li>
                <IconCheck width={16} height={16} /> Polarized nylon lenses —
                clearer than glass, half the weight
              </li>
              <li>
                <IconCheck width={16} height={16} /> Five-barrel steel hinges
                rated for 30,000 folds
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
