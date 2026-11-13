import type { Collection, Product } from "./types";

/**
 * The entire catalog lives here. To pivot the store to different products,
 * replace this file, every page, filter, cart line and checkout item is
 * generated from it.
 *
 * Current lineup: genuine Randolph Engineering frames + accessories.
 * Photos live in public/assets/img/products/, per-colorway shots resolve
 * automatically at <slug>-<colorway-id>.jpg (see ProductImage).
 */
export const products: Product[] = [
  {
    slug: "aviator",
    name: "Aviator",
    tagline: "The original, hand-assembled since 1978.",
    description:
      "The frame that built the Randolph Engineering name. A hand-assembled aviator in 23K gold plate with mineral-glass lenses and signature bayonet temples. Issued to military pilots for decades, finished one at a time.",
    price: 259,
    collection: "classics",
    silhouette: "aviator",
    colorways: [
      { id: "gold-agx", name: "23K Gold", frameColor: "#b08d4f", lensColor: "#3d4449", lensName: "AGX Gray Glass" },
      { id: "white-gold", name: "Jetway White Gold", frameColor: "#c9c9c7", lensColor: "#41474d", lensName: "Gray Polarized" },
      { id: "gun-blue", name: "Satin Gunmetal", frameColor: "#4a4d52", lensColor: "#5d8fa4", lensName: "Blue Hydro" },
    ],
    tint: "#e8e4da",
    rating: 4.9,
    reviewCount: 2847,
    badge: "Best Seller",
    stock: 34,
    features: [
      "Hand-assembled metal frame, 200+ steps, one at a time",
      "Mineral-glass lenses, scratch-resistant, distortion-free",
      "Bayonet temples, zero pressure under headgear",
      "Includes leather case, microfiber cloth & care kit",
    ],
    sku: "ZL-AVT",
    image: "/assets/img/products/aviator.jpg",
    gallery: [
      "/assets/img/products/aviator-2.jpg",
      "/assets/img/products/aviator-3.jpg",
      "/assets/img/products/aviator-4.jpg",
    ],
  },
  {
    slug: "navigator",
    name: "Navigator",
    tagline: "Squared pilot frame with real bayonet temples.",
    description:
      "A squared navigator silhouette in polished metal. Scratch-resistant polarized lenses, adjustable nose pads, and straight bayonet temples that sit flat under caps and headsets. The everyday frame in six frame and lens combinations.",
    price: 149,
    collection: "classics",
    silhouette: "aviator",
    colorways: [
      { id: "silver-green", name: "Polished Silver", frameColor: "#c9cbcf", lensColor: "#2d4a38", lensName: "Evergreen" },
      { id: "gold-brown", name: "Polished Gold", frameColor: "#c8a860", lensColor: "#6b4e2e", lensName: "Amber Brown" },
      { id: "gold-green", name: "Polished Gold", frameColor: "#c8a860", lensColor: "#2d4a38", lensName: "Evergreen" },
      { id: "gold-graphite", name: "Polished Gold", frameColor: "#c8a860", lensColor: "#3a3f45", lensName: "Graphite" },
      { id: "silver-graphite", name: "Polished Silver", frameColor: "#c9cbcf", lensColor: "#3a3f45", lensName: "Graphite" },
      { id: "black-graphite", name: "Matte Black", frameColor: "#24262a", lensColor: "#33383e", lensName: "Graphite" },
    ],
    tint: "#e9ebee",
    rating: 4.8,
    reviewCount: 412,
    badge: "New",
    stock: 58,
    features: [
      "Polished metal frame with straight bayonet temples",
      "Polarized lenses, 100% UVA/UVB protection",
      "Adjustable silicone nose pads",
      "Includes hard case and microfiber cloth",
    ],
    sku: "ZL-NAV",
    image: "/assets/img/products/navigator.jpg",
    gallery: [
      "/assets/img/products/navigator-gold-brown.jpg",
      "/assets/img/products/navigator-gold-green.jpg",
      "/assets/img/products/navigator-silver-graphite.jpg",
      "/assets/img/products/navigator-black-graphite.jpg",
    ],
  },
  {
    slug: "concorde",
    name: "Concorde",
    tagline: "The teardrop that outran the jet age.",
    description:
      "Named for the aircraft it outlived, the Concorde wraps mineral-glass lenses in a sweeping gunmetal teardrop. Bigger coverage than the Aviator, same bayonet temples, built for open sky and long light.",
    price: 269,
    collection: "classics",
    silhouette: "aviator",
    colorways: [
      { id: "gun-skytec", name: "Satin Gunmetal", frameColor: "#4a4d52", lensColor: "#4e7d84", lensName: "SkyTec Blue-Green" },
    ],
    tint: "#e2e6e6",
    rating: 4.8,
    reviewCount: 1632,
    stock: 21,
    features: [
      "Deep teardrop lenses, wider field of coverage",
      "SkyTec mineral glass with blue-green mirror",
      "Bayonet temples, adjustable nose pads",
      "Hand-assembled in Massachusetts, USA",
    ],
    sku: "ZL-CON",
    image: "/assets/img/products/concorde.jpg",
    gallery: [
      "/assets/img/products/concorde-2.jpg",
      "/assets/img/products/concorde-3.jpg",
      "/assets/img/products/aviator-4.jpg",
    ],
  },
  {
    slug: "aviator-cobalt",
    name: "Aviator Cobalt",
    tagline: "The classic aviator, electrified.",
    description:
      "Same hand-assembled aviator frame, charged with a cobalt-blue mirrored lens that cuts glare off water and asphalt. The pair people ask about before they say hello.",
    price: 279,
    collection: "limited",
    silhouette: "aviator",
    colorways: [
      { id: "satin-gun", name: "Satin Gunmetal", frameColor: "#4a4d52", lensColor: "#2e6fb8", lensName: "Cobalt Blue Mirror" },
    ],
    tint: "#dde4ec",
    rating: 4.8,
    reviewCount: 941,
    stock: 18,
    features: [
      "Cobalt-blue mirrored mineral-glass lenses",
      "Anti-reflective back coating kills bounce glare",
      "Satin gunmetal frame, bayonet temples",
      "Includes leather case, microfiber cloth & care kit",
    ],
    sku: "ZL-CBT",
    image: "/assets/img/products/aviator-cobalt.jpg",
    gallery: [
      "/assets/img/products/aviator-cobalt-2.jpg",
      "/assets/img/products/aviator-2.jpg",
      "/assets/img/products/aviator-4.jpg",
    ],
  },
  {
    slug: "shelby-aviator-ii",
    name: "Shelby Aviator II",
    tagline: "Carroll Shelby's frame, blacked out.",
    description:
      "A collaboration frame in black chrome with a blue-violet gradient lens. The same silhouette Carroll Shelby wore trackside. Small-batch run; when it's gone, it's gone.",
    price: 449,
    collection: "limited",
    silhouette: "aviator",
    colorways: [
      { id: "black-chrome", name: "Black Chrome", frameColor: "#232325", lensColor: "#4a4a6e", lensName: "Code Black Gradient" },
    ],
    tint: "#e0dde2",
    rating: 4.9,
    reviewCount: 214,
    badge: "New",
    stock: 9,
    features: [
      "Limited-edition black chrome finish",
      "Blue-violet gradient mineral-glass lenses",
      "Serialized, hand-assembled frame",
      "Includes leather case, microfiber cloth & care kit",
    ],
    sku: "ZL-SHB",
    image: "/assets/img/products/shelby-aviator-ii.jpg",
    gallery: [
      "/assets/img/products/shelby-aviator-ii-2.jpg",
      "/assets/img/products/aviator-2.jpg",
      "/assets/img/products/travel-case-2.jpg",
    ],
  },
  {
    slug: "retainer-strap",
    name: "Leather Retainer Strap",
    tagline: "Full-grain leather, snap-fit, stays put.",
    description:
      "A hand-stitched full-grain leather retainer that snaps to your temples and keeps your frames exactly where you left them: around your neck, not on the asphalt.",
    price: 39,
    collection: "accessories",
    silhouette: "accessory",
    colorways: [
      { id: "cognac", name: "Cognac / Gunmetal", frameColor: "#6b4126", lensColor: "#4a4d52", lensName: "Gunmetal snaps" },
      { id: "dark-brown", name: "Dark Brown / Gunmetal", frameColor: "#3d2b1e", lensColor: "#4a4d52", lensName: "Gunmetal snaps" },
      { id: "brown-gold", name: "Dark Brown / Gold", frameColor: "#3d2b1e", lensColor: "#b08d4f", lensName: "Gold snaps" },
    ],
    tint: "#ece4d8",
    rating: 4.7,
    reviewCount: 388,
    stock: 52,
    features: [
      "Full-grain leather, saddle-stitched by hand",
      "Snap-fit ends, secures to most metal temples",
      "Ages beautifully with wear",
    ],
    sku: "ZL-STR",
    image: "/assets/img/products/retainer-strap.jpg",
    gallery: [
      "/assets/img/products/retainer-strap-dark-brown.jpg",
      "/assets/img/products/retainer-strap-brown-gold.jpg",
    ],
  },
  {
    slug: "travel-case",
    name: "Travel Case",
    tagline: "Three pairs, one indestructible case.",
    description:
      "A pebbled leather travel case with three padded slots and a plush interior. Keeps a small collection safe in a carry-on or a glovebox. Embossed 'Handcrafted American Eyewear' inside the lid.",
    price: 65,
    collection: "accessories",
    silhouette: "accessory",
    colorways: [
      { id: "black", name: "Black", frameColor: "#1b1815", lensColor: "#3d4449", lensName: "Black leather" },
      { id: "brown", name: "Brown", frameColor: "#5c3a22", lensColor: "#3d4449", lensName: "Brown leather" },
    ],
    tint: "#e6e2dc",
    rating: 4.9,
    reviewCount: 276,
    stock: 40,
    features: [
      "Pebbled leather shell, padded three-slot interior",
      "Zip closure with tethered lid",
      "Fits most aviator and square frames",
    ],
    sku: "ZL-CSE",
    image: "/assets/img/products/travel-case.jpg",
    gallery: [
      "/assets/img/products/travel-case-2.jpg",
      "/assets/img/products/travel-case-brown.jpg",
    ],
  },
  {
    slug: "lens-cleaning-kit",
    name: "Lens Cleaning Kit",
    tagline: "Everything mineral glass asks for.",
    description:
      "A complete care kit: lens spray, microfiber cloth and a soft brush, sized for for a glovebox or desk drawer. Because a $300 lens deserves better than a t-shirt hem.",
    price: 25,
    collection: "accessories",
    silhouette: "accessory",
    colorways: [
      { id: "kit", name: "Standard Kit", frameColor: "#3d4449", lensColor: "#4a4d52", lensName: "One kit" },
    ],
    tint: "#e8e6e0",
    rating: 4.8,
    reviewCount: 154,
    stock: 60,
    features: [
      "Ammonia-free lens spray, safe on all coatings",
      "Two premium microfiber cloths",
      "Compact, travels in the case pocket",
    ],
    sku: "ZL-LCK",
    image: "/assets/img/products/lens-cleaning-kit.jpg",
    gallery: ["/assets/img/products/microfiber-set.jpg"],
  },
  {
    slug: "microfiber-set",
    name: "Microfiber Cloth 3-Pack",
    tagline: "The humble hero of clear lenses.",
    description:
      "Three dense-weave microfiber cloths: one for the case, one for the car, one for the pocket you're currently patting down. The cheapest insurance your lenses can buy.",
    price: 15,
    collection: "accessories",
    silhouette: "accessory",
    colorways: [
      { id: "assorted", name: "Assorted", frameColor: "#4a4d52", lensColor: "#55606a", lensName: "3-pack" },
    ],
    tint: "#e4e4e0",
    rating: 4.8,
    reviewCount: 203,
    stock: 80,
    features: [
      "Dense-weave microfiber, lifts oil, no smearing",
      "Safe on mineral glass and all coatings",
      "Machine washable, lasts for years",
    ],
    sku: "ZL-MFS",
    image: "/assets/img/products/microfiber-set.jpg",
    gallery: [],
  },
];

export const collections: Collection[] = [
  {
    slug: "classics",
    name: "The Classics",
    description: "Hand-assembled aviators, the frames that built the name.",
    image: "/assets/img/collections/classics.jpg",
  },
  {
    slug: "limited",
    name: "Limited & Collabs",
    description: "Small-batch runs and collab frames. Gone when they're gone.",
    image: "/assets/img/collections/limited.jpg",
  },
  {
    slug: "accessories",
    name: "Accessories",
    description: "Cases, straps and care kits, keep your pair pristine.",
    image: "/assets/img/collections/accessories.jpg",
  },
];

export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function relatedProducts(product: Product, count = 3): Product[] {
  const sameCollection = products.filter(
    (p) => p.slug !== product.slug && p.collection === product.collection
  );
  const rest = products.filter(
    (p) => p.slug !== product.slug && p.collection !== product.collection
  );
  return [...sameCollection, ...rest].slice(0, count);
}
