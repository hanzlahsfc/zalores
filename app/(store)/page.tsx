import Link from "next/link";
import { site } from "@/lib/site";
import { collections, getProduct, products } from "@/lib/products";
import { formatPrice } from "@/lib/format";
import ProductCard from "@/components/ProductCard";
import ProductImage from "@/components/ProductImage";
import {
  IconArrow,
  IconRefresh,
  IconShield,
  IconSun,
  IconTruck,
  Stars,
} from "@/components/Icons";

const hero = getProduct("aviator")!;

const featured = ["navigator", "aviator", "concorde", "shelby-aviator-ii"].map(
  (s) => getProduct(s)!
);

const perks = [
  {
    icon: IconTruck,
    title: "Free shipping",
    body: `Free nationwide delivery over ${formatPrice(site.freeShippingThreshold)}. Orders before 2pm ship the same day.`,
  },
  {
    icon: IconSun,
    title: "UV400 protection",
    body: "Every lens blocks 100% of UVA and UVB rays, with polarized options on most frames.",
  },
  {
    icon: IconRefresh,
    title: "30-day returns",
    body: "Not the right fit? Send unworn frames back within 30 days for a full refund.",
  },
  {
    icon: IconShield,
    title: "2-year warranty",
    body: "Hinges, coatings and finish are covered against defects for two full years.",
  },
];

const reviews = [
  {
    quote:
      "The mineral glass is on another level. Sharper and clearer than anything I've owned, including pairs twice the price.",
    name: "Ayesha R.",
    product: "Aviator",
  },
  {
    quote:
      "Cobalt lenses killed the glare off the water completely. First pair that has survived a full year of fishing.",
    name: "Bilal K.",
    product: "Aviator Cobalt",
  },
  {
    quote:
      "Six hours under a headset with zero pressure points. Now I get why pilots swear by bayonet temples.",
    name: "Hassan S.",
    product: "Concorde",
  },
];

export default function HomePage() {
  return (
    <>
      <section className="banner">
        <div className="banner__media">
          <ProductImage
            product={hero}
            src="/assets/img/hero.jpg"
            uid="banner"
            priority
          />
        </div>
        <div className="banner__content page-width">
          <div className="banner__box">
            <h2 className="banner__heading h0">Built to outlast trends</h2>
            <p className="banner__text">
              Hand-assembled metal frames with real mineral-glass lenses.
            </p>
            <div className="banner__buttons">
              <Link href="/shop/" className="button button--light">
                Shop all
              </Link>
              <Link
                href="/shop/?collection=classics"
                className="button button--outline-light"
              >
                Shop sunglasses
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="page-width">
          <div className="title-wrapper">
            <h2 className="h2">Bestsellers</h2>
            <Link href="/shop/" className="link">
              View all
            </Link>
          </div>
          <ul className="product-grid product-grid--4" role="list">
            {featured.map((p, i) => (
              <li key={p.slug}>
                <ProductCard product={p} priority={i < 2} />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section">
        <div className="page-width">
          <div className="image-with-text">
            <div className="image-with-text__media">
              <ProductImage
                product={hero}
                src="/assets/img/about.jpg"
                uid="iwt"
              />
            </div>
            <div className="image-with-text__content">
              <h2 className="h1">Made by hand, one frame at a time</h2>
              <p>
                Every frame is soldered, plated and polished through more than
                200 steps, then fitted with mineral-glass lenses that stay
                sharp and resist scratches far longer than plastic.
              </p>
              <Link href="/about/" className="button">
                Our story
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="page-width">
          <div className="title-wrapper">
            <h2 className="h2">Shop by collection</h2>
          </div>
          <ul className="collection-list" role="list">
            {collections.map((c) => {
              const rep = products.find((p) => p.collection === c.slug)!;
              return (
                <li key={c.slug}>
                  <Link href={`/shop/?collection=${c.slug}`} className="collection-card">
                    <div className="collection-card__media">
                      <ProductImage product={rep} src={c.image} uid={`col-${c.slug}`} />
                    </div>
                    <h3 className="collection-card__title">
                      <span>{c.name}</span>
                      <IconArrow />
                    </h3>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section className="section section--bg">
        <div className="page-width">
          <ul className="multicolumn-list" role="list">
            {perks.map((p) => (
              <li key={p.title} className="multicolumn-card">
                <p.icon className="mc-icon" />
                <h3>{p.title}</h3>
                <p>{p.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section section--bg" style={{ paddingTop: 0 }}>
        <div className="page-width">
          <div className="title-wrapper">
            <h2 className="h2">What customers are saying</h2>
          </div>
          <ul className="multicolumn-list multicolumn-list--3" role="list">
            {reviews.map((r) => (
              <li key={r.name}>
                <figure className="testimonial">
                  <Stars rating={5} />
                  <blockquote>&ldquo;{r.quote}&rdquo;</blockquote>
                  <figcaption>
                    <strong>{r.name}</strong>
                    Verified buyer · {r.product}
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section">
        <div className="page-width">
          <div className="rich-text">
            <h2 className="h1">Real glass makes the difference</h2>
            <p>
              Mineral-glass lenses are optically clearer and far harder than
              the polycarbonate in most sunglasses. Once you have worn them,
              it is hard to go back.
            </p>
            <Link href="/shop/" className="button">
              Shop all
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
