import type { Collection, Product } from "./types";

/**
 * The entire catalog lives here. To pivot the store to different products,
 * replace this file — every page, filter, cart line and checkout item is
 * generated from it.
 */
export const products: Product[] = [
  {
    slug: "meridian",
    name: "Meridian",
    tagline: "The everyday classic, sharpened.",
    description:
      "A clean squared silhouette in deep onyx acetate with smoke polarized lenses. The Meridian is the pair you reach for without thinking — balanced, unfussy, and quietly sharp on every face.",
    price: 89,
    collection: "everyday",
    silhouette: "square",
    colorways: [
      { id: "onyx", name: "Onyx", frameColor: "#1b1815", lensColor: "#3d4449", lensName: "Smoke Polarized" },
      { id: "tortoise", name: "Tortoise", frameColor: "#5c3a22", lensColor: "#6b4423", lensName: "Brown Polarized" },
      { id: "sand", name: "Crystal Sand", frameColor: "#c3a982", lensColor: "#4a5540", lensName: "Olive Polarized" },
    ],
    tint: "#e8e0d2",
    rating: 4.9,
    reviewCount: 847,
    badge: "Best Seller",
    stock: 34,
    features: [
      "Hand-polished Italian acetate",
      "Polarized UV400 nylon lenses",
      "Anti-scratch + anti-glare coatings",
      "5-barrel stainless hinges",
    ],
    sku: "ZL-MRD-ONX",
    image: "/assets/img/products/meridian.jpg",
    gallery: [
      "/assets/img/products/meridian-2.jpg",
      "/assets/img/products/meridian-3.jpg",
      "/assets/img/products/meridian-4.jpg",
    ],
  },
  {
    slug: "solana",
    name: "Solana",
    tagline: "Cat-eye confidence, warmed in amber.",
    description:
      "An upswept cat-eye in hand-laid tortoise acetate with gradient amber lenses. Solana turns a coffee run into an entrance — bold enough to notice, refined enough to wear daily.",
    price: 95,
    compareAt: 118,
    collection: "statement",
    silhouette: "cat-eye",
    colorways: [
      { id: "amber", name: "Amber Tortoise", frameColor: "#5c3a22", lensColor: "#8a5a2e", lensName: "Amber Gradient" },
      { id: "noir", name: "Noir", frameColor: "#1b1815", lensColor: "#3d4449", lensName: "Smoke Polarized" },
      { id: "blush", name: "Blush", frameColor: "#c78f7e", lensColor: "#7e5152", lensName: "Rose Gradient" },
    ],
    tint: "#efe3d3",
    rating: 4.8,
    reviewCount: 412,
    badge: "Sale",
    stock: 21,
    features: [
      "Hand-laid tortoise acetate",
      "Polarized gradient lenses, UV400",
      "Featherweight — 24g",
      "Includes hard case + microfiber",
    ],
    sku: "ZL-SLN-AMB",
    image: "/assets/img/products/solana.jpg",
    gallery: [
      "/assets/img/products/solana-2.jpg",
      "/assets/img/products/solana-3.jpg",
      "/assets/img/products/solana-4.jpg",
    ],
  },
  {
    slug: "coastline",
    name: "Coastline",
    tagline: "The aviator, rebuilt for glare.",
    description:
      "A modern aviator in brushed gold with bottle-green polarized lenses. Built for open roads and water glare — the Coastline cuts reflection without muting the view.",
    price: 110,
    collection: "everyday",
    silhouette: "aviator",
    colorways: [
      { id: "gold", name: "Brushed Gold", frameColor: "#b08d4f", lensColor: "#2f4a3e", lensName: "G-15 Green Polarized" },
      { id: "gunmetal", name: "Gunmetal", frameColor: "#4a4d52", lensColor: "#55606a", lensName: "Slate Polarized" },
      { id: "black", name: "Matte Black", frameColor: "#24221f", lensColor: "#3d4449", lensName: "Smoke Polarized" },
    ],
    tint: "#dde4dd",
    rating: 4.9,
    reviewCount: 623,
    stock: 18,
    features: [
      "Aerospace-grade alloy frame",
      "G-15 polarized lenses, UV400",
      "Adjustable silicone nose pads",
      "Salt-water resistant finish",
    ],
    sku: "ZL-CST-GLD",
    image: "/assets/img/products/coastline.jpg",
    gallery: [
      "/assets/img/products/coastline-2.jpg",
      "/assets/img/products/coastline-3.jpg",
      "/assets/img/products/coastline-4.jpg",
    ],
  },
  {
    slug: "atlas",
    name: "Atlas",
    tagline: "Round lenses, quiet presence.",
    description:
      "Perfectly round lenses in a slim gunmetal frame. The Atlas is understated by design — a frame that disappears into your look and sharpens everything else.",
    price: 85,
    collection: "statement",
    silhouette: "round",
    colorways: [
      { id: "gunmetal", name: "Gunmetal", frameColor: "#4a4d52", lensColor: "#55606a", lensName: "Slate Polarized" },
      { id: "bronze", name: "Antique Bronze", frameColor: "#8a6b42", lensColor: "#6b4423", lensName: "Brown Polarized" },
      { id: "black", name: "Matte Black", frameColor: "#24221f", lensColor: "#3d4449", lensName: "Smoke Polarized" },
    ],
    tint: "#e2e4e8",
    rating: 4.7,
    reviewCount: 356,
    stock: 27,
    features: [
      "Feather-light stainless frame",
      "Polarized slate lenses, UV400",
      "Adjustable nose bridge",
      "Includes hard case + microfiber",
    ],
    sku: "ZL-ATL-GUN",
    image: "/assets/img/products/atlas.jpg",
    gallery: [
      "/assets/img/products/atlas-2.jpg",
      "/assets/img/products/atlas-3.jpg",
      "/assets/img/products/atlas-4.jpg",
    ],
  },
  {
    slug: "ridgeline",
    name: "Ridgeline",
    tagline: "Sport optics without the sport look.",
    description:
      "A low-wrap performance frame in matte graphite with copper contrast lenses. Grip where it counts, ventilation where you need it — and a silhouette you'll still wear to dinner.",
    price: 120,
    collection: "sport",
    silhouette: "sport",
    colorways: [
      { id: "graphite", name: "Matte Graphite", frameColor: "#2e2c29", lensColor: "#7a4a26", lensName: "Copper Contrast" },
      { id: "olive", name: "Trail Olive", frameColor: "#5a6045", lensColor: "#4a5540", lensName: "Bronze Polarized" },
      { id: "black", name: "Matte Black", frameColor: "#24221f", lensColor: "#3d4449", lensName: "Smoke Polarized" },
    ],
    tint: "#e0dcd4",
    rating: 4.8,
    reviewCount: 289,
    badge: "New",
    stock: 15,
    features: [
      "Flexible TR90 performance frame",
      "Copper contrast polarized lenses",
      "No-slip nose + temple grip",
      "Ventilated anti-fog design",
    ],
    sku: "ZL-RDG-GRP",
    image: "/assets/img/products/ridgeline.jpg",
    gallery: [
      "/assets/img/products/ridgeline-2.jpg",
      "/assets/img/products/ridgeline-3.jpg",
      "/assets/img/products/ridgeline-4.jpg",
    ],
  },
  {
    slug: "verano",
    name: "Verano",
    tagline: "Honey tortoise, golden-hour ready.",
    description:
      "A softened wayfarer in translucent honey acetate with warm brown lenses. Verano is summer bottled — easy, warm, and impossible to take off.",
    price: 79,
    collection: "everyday",
    silhouette: "wayfarer",
    colorways: [
      { id: "honey", name: "Honey Tortoise", frameColor: "#8a5426", lensColor: "#6b4423", lensName: "Brown Polarized" },
      { id: "onyx", name: "Onyx", frameColor: "#1b1815", lensColor: "#3d4449", lensName: "Smoke Polarized" },
      { id: "amber", name: "Amber", frameColor: "#b0722e", lensColor: "#8a5a2e", lensName: "Amber Gradient" },
    ],
    tint: "#eee4d4",
    rating: 4.8,
    reviewCount: 534,
    badge: "Low Stock",
    stock: 7,
    features: [
      "Translucent honey acetate",
      "Polarized brown lenses, UV400",
      "5-barrel stainless hinges",
      "Includes hard case + microfiber",
    ],
    sku: "ZL-VRN-HNY",
    image: "/assets/img/products/verano.jpg",
    gallery: [
      "/assets/img/products/verano-2.jpg",
      "/assets/img/products/verano-3.jpg",
      "/assets/img/products/verano-4.jpg",
    ],
  },
];

export const collections: Collection[] = [
  {
    slug: "everyday",
    name: "Everyday",
    description: "Quiet icons built for daily wear — clean lines, zero effort.",
    image: "/assets/img/collections/everyday.jpg",
  },
  {
    slug: "statement",
    name: "Statement",
    description: "Frames with presence. For the days you want to be seen.",
    image: "/assets/img/collections/statement.jpg",
  },
  {
    slug: "sport",
    name: "Sport",
    description: "Performance optics that don't look like gym gear.",
    image: "/assets/img/collections/sport.jpg",
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
